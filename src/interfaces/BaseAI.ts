import { ChatOllama } from "@langchain/ollama";
import OpenAI from "openai";

export interface BaseAI {
    model: InstanceType<typeof ChatOllama | typeof OpenAI>;
    answer(input: string): Promise<string>;
}