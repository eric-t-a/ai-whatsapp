import express from 'express';
import Whisper from "node-speech-recognition";
import { AI } from './class/AI';
import { WhatsAppAPI } from './class/WhatsappAPI';
import { configureMongoose } from './config/mongoose';
import webhooks from './routes/wehbooks';
import chats from './routes/chatRoutes';
import cors from 'cors'

export const ai = new AI();
export const wpp = new WhatsAppAPI;
export const whisper = new Whisper();
(async () => await whisper.init('base'))()

export const createApp = async () => {
    const app = express();
    app.use(express.json());
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }));

    app.use("/webhook", webhooks);
    app.use("/chats", chats);
    
    const mongoConnectionString = process.env.MONGO_URI || '';
    const dbName = process.env.MONGO_DB_NAME || '';

    await configureMongoose({
        connectionString: mongoConnectionString,
        databaseName: dbName
    });
    
    return app;
}