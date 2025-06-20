import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { AI } from './class/ai';
import { WhatsAppWeb } from './class/whatsapp';
import Whisper from "node-speech-recognition";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
var ai: InstanceType<typeof AI>, wpp: InstanceType<typeof WhatsAppWeb>, whisper: InstanceType<typeof Whisper>;

async function init() {
    ai = new AI();
    wpp = new WhatsAppWeb(onMessageReceived);
    whisper = new Whisper();
    await whisper.init('base');
}

init()

async function onMessageReceived(from: string, metadata: Record<string, string>) {
    if(from != '5516991045872') return;
    if(metadata.type == 'other') {
        await wpp.sendTextMessage(from, 'Sorry, I only understand text and audio');
        return;
    }

    await wpp.startTyping(from);
    
    let content = metadata.text;

    if(metadata.type == 'audio') {
        content = (await whisper.transcribe(metadata.path)).text;
        console.log(content)
    }
    
    const response = await ai.answer(content)
    const data = await wpp.sendTextMessage(from, response)
    await wpp.stopTyping(from)
}

app.get('/', (req: Request, res: Response) => {
    res.send(`Hello, TypeScript Express!`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});