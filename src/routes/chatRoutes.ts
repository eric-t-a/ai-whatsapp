import express, { Request, Response } from 'express';
import { Msg, MsgReceivedBody } from '../class/WhatsappAPI';
import { ai, wpp } from '../app';
import { Message, MessageModel, MsgType, saveNewMessage } from '../models/message';
import { Recipient, RecipientModel } from '../models/recipient';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const skip = parseInt(req.query.skip?.toString() || '0', 10);
    const recipients = await RecipientModel.find().populate('lastMsg').sort({ lastMsgSentTime: -1 }).skip(skip).limit(20);
    
    res.status(200).send({recipients});
});

router.get('/:id/messages', async (req: Request, res: Response) => {
    const recipientId = req.params.id;
    const skip = parseInt(req.query.skip?.toString() || '0', 10);
    const messages = await MessageModel.find({ recipient: recipientId }).sort({ sentTime: 1 }).skip(skip).limit(20);
    
    res.status(200).send({messages});
});

router.post('/', async (req: Request, res: Response) => {
    const body = req.body as MsgReceivedBody;
    const change = body.entry[0].changes[0]
    const messages = change.value.messages;

    if(!messages || !messages.length) return;




    res.status(200).send('ok');
});

export default router;