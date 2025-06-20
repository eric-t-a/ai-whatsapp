import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { AI } from './class/ai';
import { WhatsAppWeb } from './class/whatsapp';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const ai = new AI()
const wpp = new WhatsAppWeb(onMessageReceived)

async function onMessageReceived(from: string, metadata: Record<string, string>) {
    if(metadata.type == 'other') {
        await wpp.sendTextMessage(from, 'Sorry, I only understand text and audio');
        return;
    }

    await wpp.startTyping(from);
    
    let content = metadata.text;

    if(metadata.type == 'audio') {
        content = (await ai.transcribe(metadata.path)).text;
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