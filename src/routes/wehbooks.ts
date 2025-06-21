import express, { Request, Response } from 'express';
import { Msg, MsgReceivedBody } from '../class/WhatsappAPI';
import { ai, wpp } from '../app';

const router = express.Router();

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

router.get('/', (req: Request, res: Response) => {
    res.status(200).send(req.query['hub.challenge']);
});

router.post('/', async (req: Request, res: Response) => {
    const body = req.body as MsgReceivedBody;
    const messages = body.entry[0].changes[0].value.messages;

    if(!messages || !messages.length) return;

    messages.forEach((msg) => {
    
        if(!msg.text?.body) return;
        onMessageReceived(msg)
    })


    res.status(200).send('ok');
});

export default router;