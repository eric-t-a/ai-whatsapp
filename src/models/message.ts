import mongoose, { Schema } from "mongoose";
import { Recipient, RecipientModel } from "./recipient";


export enum MsgType {
    Text = "text",
    BtnReply = "btn-reply",
    Btn = "btn",
    List = "list",
    ListReply = "list-reply",
    Audio = "audio",
    Image = "image",
    Document = "document"
}

export type Message = {
    content?: string
    recipient: string
    type: MsgType
    fromMe: boolean
    ref?: string
    sentTime: Date
    createdDate?: Date
    updatedDate?: Date
}

export const saveNewMessage = async (message: Message, recipient: Recipient) => {
    await MessageModel.validate(message);
    const newMessage = new MessageModel(message);
    newMessage.save();

    recipient.lastMsg = newMessage._id;
    recipient.lastMsgSentTime = newMessage.sentTime;

    await RecipientModel.validate(recipient);
    const updatedRecipient = await RecipientModel
        .findOneAndUpdate({ _id: recipient._id }, recipient, { upsert: true, new: true })
        .exec();
}

const schema = new Schema({
    content: String,
    recipient: {
        type: String,
        ref: 'Recipient',
        required: true
    },
    type: {
        type: String,
        required: true,
        default: MsgType.Text
    },
    fromMe: {
        type: Boolean,
        required: true
    },
    ref: String,
    sentTime: {
        type: Date,
        required: true
    },
}, {
    timestamps: {
        createdAt: "createdDate",
        updatedAt: "updatedDate"
    }
});

export const MessageModel = mongoose.model<Message>("Message", schema, "Message");