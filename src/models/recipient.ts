import mongoose, { Schema } from "mongoose";

export type Recipient = {
    _id: string
    name?: string
    lastMsg?: mongoose.Types.ObjectId
    createdDate?: Date
    updatedDate?: Date
}

const schema = new Schema({
    _id: String,
    name: String,
    lastMsg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    ref: String
}, {
    timestamps: {
        createdAt: "createdDate",
        updatedAt: "updatedDate"
    }
});

export const RecipientModel = mongoose.model<Recipient>("Recipient", schema, "Recipient");