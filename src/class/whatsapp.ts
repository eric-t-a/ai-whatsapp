import makeWASocket, { Browsers, DisconnectReason, WASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState } from '@whiskeysockets/baileys';
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
    }

    async getPhoneNumber(): Promise<string> {
        return new Promise(resolve => {
            rl.question("What's your phone number?", answer => {
                resolve(answer);
            });
        });
    }
}