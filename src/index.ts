import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import Whisper from "node-speech-recognition";
import { AI } from './class/AI';
import { Msg, MsgReceivedBody, WhatsAppAPI } from './class/WhatsappAPI';
import { configureMongoose } from './config/mongoose';
dotenv.config();

const app = express();
app.use(express.json())
const port = process.env.PORT || 3000;
var ai: InstanceType<typeof AI>, wpp: InstanceType<typeof WhatsAppAPI>, whisper: InstanceType<typeof Whisper>;

async function init() {
    ai = new AI();
    wpp = new WhatsAppAPI;
    whisper = new Whisper();
    await whisper.init('base');

    const mongoConnectionString = process.env.MONGO_URI || '';
    const dbName = process.env.MONGO_DB_NAME || '';
    
    await configureMongoose({
        connectionString: mongoConnectionString,
        databaseName: dbName
    });
}

init()

async function onMessageReceived(msg: Msg) {
    const msgId = msg.id;
    const btn = msg.interactive?.button_reply?.title;
    const from = msg.from;

    await wpp.startTyping(msgId);
    
    let content = msg.text?.body ?? '';

    if(msg.type == 'audio') {
        // TODO refactor this
        // content = (await whisper.transcribe(metadata.path)).text;
    }
    
    const response = await ai.answer(content)
    const data = await wpp.sendTextMessage(from, response)
}

app.get('/webhook', (req: Request, res: Response) => {
    res.status(200).send(req.query['hub.challenge']);
});

app.post('/webhook', async (req: Request, res: Response) => {
    const body = req.body as MsgReceivedBody;
    const messages = body.entry[0].changes[0].value.messages;

    if(!messages || !messages.length) return;

    messages.forEach((msg) => {
    
        if(!msg.text?.body) return;
        onMessageReceived(msg)
    })


    res.status(200).send('ok');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});