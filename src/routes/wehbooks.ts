import express, { Request, Response } from 'express';
import { Msg, MsgReceivedBody } from '../class/WhatsappAPI';
import { ai, wpp } from '../app';
import { Message, MsgType, saveNewMessage } from '../models/message';
import { Recipient } from '../models/recipient';

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
    
    const response = await ai.answer(content);
    const data = await wpp.sendTextMessage(from, response);

    const message: Message = {
        content: response,
        recipient: from,
        type: MsgType.Text,
        fromMe: true,
        sentTime: new Date()
    }

    const recipient: Recipient = {
        _id: from
    };

    await saveNewMessage(message, recipient);
}

router.get('/', (req: Request, res: Response) => {
    res.status(200).send(req.query['hub.challenge']);
});

router.post('/', async (req: Request, res: Response) => {
    const body = req.body as MsgReceivedBody;
    const change = body.entry[0].changes[0]
    const messages = change.value.messages;

    if(!messages || !messages.length) return;

    messages.forEach(async (msg) => {
    
        if(!msg.text?.body) return;

        const name = 
            change.value.contacts.length > 0 && change.value.contacts[0].profile.name ? 
            change.value.contacts[0].profile.name : '';
        const number = msg.from;

        const message: Message = {
            content: msg.text?.body,
            recipient: number,
            type: MsgType.Text,
            fromMe: false,
            sentTime: new Date(parseInt(`${msg.timestamp}000`))
        }

        const recipient: Recipient = {
            name,
            _id: number
        };

        await saveNewMessage(message, recipient);
        
        onMessageReceived(msg)
    })


    res.status(200).send('ok');
});

export default router;