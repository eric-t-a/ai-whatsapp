import axios from "axios";

export interface MsgReceivedBody {
    object: string;
    entry: MsgEntry[]
}

interface MsgEntry {
    id: string;
    changes: MsgChange[]
}

interface MsgChange {
    value: {
        messaging_product: string;
        metadata: {
            display_phone_number: string;
            phone_number_id: string;
        };
        contacts: MsgContact[];
        messages?: Msg[];
        statuses?: MsgStatus[];
    };
    field: string;
}

interface MsgStatus {
    id: string;
    status: string;
    timestamp: string;
    recipient_id: string;
}

interface MsgContact {
    profile: { name?: string };
    wa_id: string;
}

interface Msg {
    from: string;
    id: string;
    timestamp: string;
    type: 'text' | 'audio' | 'image' | 'document' | 'interactive'
    document?: { filename: string; id: string; mime_type: string; }
    audio?: { id: string; mime_type: string; }
    image?: { id: string; mime_type: string; }
    text?: { body: string; }
    interactive?: {
        type: 'string', 
        button_reply?: { id: string; title: string; }
    }
}


export class WhatsAppAPI {

    constructor () {
    }

    async startTyping(msgId: string) {
        await this.axios_base({
            messaging_product: "whatsapp",
            status: "read",
            message_id: msgId,
            typing_indicator: {
              type: "text"
            }
        })
    }

    async sendTextMessage(to: string, content: string) {
        await this.axios_base({
            messaging_product: "whatsapp",    
            recipient_type: "individual",
            to: to,
            type: "text",
            text: {
                body: content
            }
        })
    }

    async axios_base(data: object) {
        await axios({
            url: `https://graph.facebook.com/${process.env.WA_VERSION}/${process.env.WA_PHONE_NUMBER_ID}/messages`,
            method: 'post',
            headers: {
              'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
          })
    }


}