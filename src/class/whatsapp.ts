import makeWASocket, { Browsers, DisconnectReason, MediaType, WASocket, downloadContentFromMessage, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState } from '@whiskeysockets/baileys';
import NodeCache from "node-cache";
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import qrcode from 'qrcode-terminal';
import { join } from 'path';
import fs from "fs";
import ffmpeg from 'fluent-ffmpeg';


const P = require("pino")({
	level: 'silent',
});

const rl = readline.createInterface({ input, output });

const generateHashFilename = () => {
    const date = new Date()

    function hashCode(str: string){
        var hash = 0,
            i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    return hashCode(date.toString());
}

export class WhatsApp {
    sock: WASocket
    online = false
    connRetry = 0
    qrRetry = 0
    qr = ''
    pairingCode = ''

    constructor (
            public onMessageReceived: (from: string, metadata: Record<string, string>) => void, 
            public usePairingCode?: boolean
        ) {
            this.init();
    }

    async init() {
        let { state, saveCreds } = await useMultiFileAuthState('temp/authstate');

        let { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            logger: P,
            printQRInTerminal: false,
            browser: Browsers.windows("Chrome"),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, P),
            },
            msgRetryCounterCache: new NodeCache(),
        });

        this.setEvents(saveCreds);

        return this
    }

    async setEvents(saveCreds: () => any) {
        const sock = this.sock;

        sock?.ev.on('creds.update', saveCreds);

        sock?.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update

            switch (connection) {
                case 'connecting':
                    return;
                case 'close':
                    // @ts-ignore
                    if ( lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut ) {
                        this.online = false;
                        this.connRetry++;
    
                        if(this.connRetry < 4){
                            await this.init();
                        }
                    } else {
                        console.log('STATE: WhatsApp connection closed');
                        this.online = false
                    }
                    break;
                case 'open':
                    this.online = true;
                    this.connRetry = 0;
                    console.log('WhatsApp connection open')
                    break;
            }


            if (qr) {
                qrcode.generate(qr, { small: true }, async (url) => {
                    
                    this.qr = url
                    if (!sock.authState.creds.registered && this.usePairingCode) {
                        const number = await this.getPhoneNumber();
                        const code = await sock.requestPairingCode(number);
                        this.pairingCode = code;
                        console.log(`Your pairing code is ${code}`)
                    } else {
                        console.log(url)
                    }

                    this.qrRetry++
                    if (this.qrRetry >= 4) {
                        // close WebSocket connection
                        this.sock.ws.close()
                        // remove all events
                        // @ts-ignore
                        this.sock.ev.removeAllListeners()
                        this.qr = ' '
                        console.log('socket connection terminated')
                    }
                })
            }
        });

        sock?.ev.on('messages.upsert', async (m) => {
            if (m.type !== 'notify') return

            m.messages.map(async (msg) => {
                if (!msg.message) return

                const messageType = Object.keys(msg.message)[0]
                if (['protocolMessage', 'senderKeyDistributionMessage'].includes(messageType)) return;

                const fromPhoneNumber = msg.key.remoteJid?.split("@")[0] || '';
                if ((fromPhoneNumber.length != 13 && fromPhoneNumber.length != 12) || !this.onlyNumbers(fromPhoneNumber)){
                    // might be group message
                    return;
                }

                const metadata: Record<string, string> = {
                    text: '',
                    type: '',
                    path: ''
                };
                switch (messageType) {
                    case 'conversation':
                        metadata['text'] = msg.message.conversation || '';
                        metadata['type'] = 'text';
                        break;
                    case 'messageContextInfo':
                        if(Object.keys(msg.message).includes('editedMessage')) {
                            // it means that the message was edited
                            // AI's gonna have answered by the time the user edits the message
                        }
                        metadata['type'] = 'other';
                        break;
                    case 'documentMessage':
                        await this.downloadMessage(msg.message.documentMessage, 'document') || '';
                        metadata['type'] = 'other';
                        break
                    case 'imageMessage':
                        await this.downloadMessage(msg.message.imageMessage, 'image') || '';
                        metadata['type'] = 'other';
                        break
                    case 'videoMessage':
                        await this.downloadMessage(msg.message.videoMessage, 'video') || '';
                        metadata['type'] = 'other';
                        break
                    case 'audioMessage':
                        const mediaContent = await this.downloadMessage(msg.message.audioMessage, 'audio') || '';
                        const wavFilePath = join(__dirname, '..', '..', `temp/${generateHashFilename()}.wav`);
                        const oggFilePath = wavFilePath.replace('.wav', '.ogg');
                        fs.writeFileSync(oggFilePath, Buffer.from(mediaContent, 'base64'));

                        // Convert to WAV
                        await new Promise((resolve, reject) => {
                          ffmpeg(oggFilePath)
                            .toFormat('wav')
                            .on('end', () => resolve(wavFilePath))
                            .on('error', reject)
                            .save(wavFilePath);
                        });

                        await fs.promises.unlink(oggFilePath);
                        metadata['type'] = 'audio';
                        metadata['path'] = wavFilePath;
                        break
                }
                this.onMessageReceived(fromPhoneNumber, metadata)
            })
        });
        
        sock?.ev.on('messages.update', async (m) => {
            let msg = m[0].update;
            if(Object.keys(msg).includes('message') && msg.message == null){
                // it means the message got deleted
            }
        });
    }

    getWhatsAppId(id: string) {
        if(!id) return '';
        if (id.includes('@g.us') || id.includes('@s.whatsapp.net')) return id;
        return id.includes('-') ? `${id}@g.us` : `${id}@s.whatsapp.net`;
    }

    onlyNumbers(phone: string){
        const phoneString = String(phone);
    
        var isOnlyNumbers = true;
    
        for (let i = 0; i < phoneString.length; i++) {
            const character = phoneString.charAt(i);
    
            if(!["0","1","2","3","4","5","6","7","8","9"].includes(character)){
                isOnlyNumbers = false;
            }
        }
    
        return isOnlyNumbers;
    }

    async verifyId(id: string) {
        if(!id) return null;
        if (id.includes('@g.us')) return id;
        const [result] = (await this.sock?.onWhatsApp(id)) || [];
        if (result?.exists) return result.jid;
        return null;
    }

    async sendTextMessage(to: string, message: string) {
        let jid = await this.verifyId(this.getWhatsAppId(to));
        if(!jid) return null;
        let actualNumber = jid.split('@')[0];

        const data = await this.sock?.sendMessage(
            this.getWhatsAppId(actualNumber),
            { text: message }
        )
        return data
    }

    async startTyping(to: string) {
        let jid = await this.verifyId(this.getWhatsAppId(to));
        if(!jid) return null;
        let actualNumber = jid.split('@')[0];

        const data = await this.sock?.sendPresenceUpdate(
            'composing',
            this.getWhatsAppId(actualNumber)
        )
        return data
    }

    async stopTyping(to: string) {
        let jid = await this.verifyId(this.getWhatsAppId(to));
        if(!jid) return null;
        let actualNumber = jid.split('@')[0];

        const data = await this.sock?.sendPresenceUpdate(
            'paused',
            this.getWhatsAppId(actualNumber)
        )
        return data
    }

    async getPhoneNumber(): Promise<string> {
        return new Promise(resolve => {
            rl.question("What's your phone number?", answer => {
                resolve(answer);
            });
        });
    }

    async downloadMessage(msg: any, msgType: MediaType) {
        let buffer = Buffer.from([])
        try {
            const stream = await downloadContentFromMessage(msg, msgType)
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
        } catch {
            return console.log('error downloading file-message')
        }
        return buffer.toString('base64')
    }
}