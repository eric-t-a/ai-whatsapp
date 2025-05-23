import makeWASocket, { Browsers, DisconnectReason, MediaType, WASocket, downloadContentFromMessage, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState } from '@whiskeysockets/baileys';
import NodeCache from "node-cache";
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import qrcode from 'qrcode-terminal';

const P = require("pino")({
	level: 'silent',
});

const rl = readline.createInterface({ input, output });

export class WhatsApp {
    sock: WASocket
    online = false
    connRetry = 0
    qrRetry = 0
    qr = ''
    pairingCode = ''
    usePairingCode = false

    constructor(usePairingCode?: boolean) {
        this.usePairingCode = usePairingCode ?? false;
        this.init();
    }

    async init() {
        let { state, saveCreds } = await useMultiFileAuthState('temp');

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
                        console.log('STATE: zap connection closed');
                        this.online = false
                    }
                    break;
                case 'open':
                    this.online = true;
                    this.connRetry = 0;
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
        })

        sock?.ev.on('messages.upsert', async (m) => {
            if (m.type !== 'notify') return

            m.messages.map(async (msg) => {
                if (!msg.message) return

                const messageType = Object.keys(msg.message)[0]
                if (['protocolMessage', 'senderKeyDistributionMessage'].includes(messageType)) return;

                let mediaContent;
                let messageContent;
                switch (messageType) {
                    case 'conversation':
                        messageContent = msg.message.conversation;
                        break;
                    case 'messageContextInfo':
                        if(Object.keys(msg.message).includes('editedMessage')) {
                            // it means that the message was edited
                            // AI's gonna have answered by the time the user edits the message
                        }
                        break;
                    case 'documentMessage':
                        mediaContent = await this.downloadMessage(msg.message.documentMessage, 'document');
                        break
                    case 'imageMessage':
                        mediaContent = await this.downloadMessage(msg.message.imageMessage, 'image');
                        break
                    case 'videoMessage':
                        mediaContent = await this.downloadMessage(msg.message.videoMessage, 'video');
                        break
                    case 'audioMessage':
                        mediaContent = await this.downloadMessage(msg.message.audioMessage, 'audio');
                        break
                    default:
                        mediaContent = ''
                        messageContent = ''
                        break
                }
            })
        })
        
        sock?.ev.on('messages.update', async (m) => {
            let msg = m[0].update;
            if(Object.keys(msg).includes('message') && msg.message == null){
                // it means the message got deleted
            }
        })
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