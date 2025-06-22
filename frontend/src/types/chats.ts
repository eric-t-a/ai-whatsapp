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
    id: string
    content?: string
    recipient: string
    type: MsgType
    fromMe: boolean
    ref?: string
    sentTime: Date
    createdDate?: Date
    updatedDate?: Date
}
  
export type Recipient = {
    id: string
    name?: string
    messages?: Message[]
    lastMsg?: Message
    lastMsgSentTime: Date
    createdDate?: Date
    updatedDate?: Date
}