import { ChatOllama } from "@langchain/ollama";
import { ConversationChain } from "langchain/chains";
import { Whisper, initWhisper } from "./whisper";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `Answer the following:`
    ),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

export class AI {
    text_model: InstanceType<typeof ChatOllama>;
    audio_model: InstanceType<typeof Whisper>;
    chain: InstanceType<typeof ConversationChain>;

    constructor() {
        this.setupModels();
    }

    private async setupModels() {
        this.text_model = new ChatOllama({ model: "llama3.2:3b" });
        this.chain = new ConversationChain({
            llm: this.text_model,
            prompt
        });
        this.audio_model = await initWhisper("tiny");
    }

    async answer(input: string) {
        const response = await this.chain.call({ input });
    
        return response.response;
    }

    async transcribe(path: string) {
        const transcribed = await this.audio_model.transcribe(path);
        return transcribed;
    }
}