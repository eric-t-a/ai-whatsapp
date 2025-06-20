import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import Whisper from "node-speech-recognition";
import { AI } from './class/AI';
import { MsgReceivedBody, WhatsAppAPI } from './class/WhatsappAPI';
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
}

init()

async function onMessageReceived(lastMsgId: string, from: string, type: string, metadata: Record<string, string>) {
    if(type == 'other') {
        await wpp.sendTextMessage(from, 'Sorry, I only understand text and audio');
        return;
    }

    await wpp.startTyping(lastMsgId);
    
    let content = metadata.text;

    if(type == 'audio') {
        content = (await whisper.transcribe(metadata.path)).text;
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

    const msg = messages[0].text?.body;
    const lastMsgId = messages[0].id;
    const btn = messages[0].interactive?.button_reply?.title;
    const from = messages[0].from;

    if(!msg) return;
    onMessageReceived(lastMsgId, from, 'text', { text: msg })

    res.status(200).send('ok');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});