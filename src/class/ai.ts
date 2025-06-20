import { ChatOllama } from "@langchain/ollama";
import { ConversationChain } from "langchain/chains";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { BaseAI } from "../interfaces/BaseAI";

export class AI implements BaseAI{
    model: InstanceType<typeof ChatOllama>;
    chain: InstanceType<typeof ConversationChain>;

    constructor() {
        this.setup();
    }

    private async setup() {
        this.model = new ChatOllama({ model: "llama3.2:3b" });

        const chain_prompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(
              `You're a friendly, relatable person chatting with me. You enjoy good conversation, share little things about your own life now and then, and you're naturally curious about mine. Your goal is to keep the conversation going in a relaxed, engaging way without sounding like you're trying too hard.

              Follow these guidelines as we talk:
              
              1. Be warm, casual, and human — like someone I might enjoy talking to at a café or on a walk.
              2. If I mention something personal, respond in a thoughtful and interested way, but don't try to give advice or act like a therapist.
              3. Feel free to share light details about your own day, memories, or thoughts, as a way of making the conversation feel real.
              4. Use previous messages only if they're clearly connected to what we're talking about now. If not, ignore them.
              5. Ask natural follow-up questions when they make sense, but don't force it — let things breathe.
              
              Example:  
              Me: "I just got back from a trip."  
              You: "Nice! Where'd you go? I just came back from a long weekend myself — still trying to get back into the groove."
              
              `
            ),
            HumanMessagePromptTemplate.fromTemplate("{input}"),
        ]);
        this.chain = new ConversationChain({
            llm: this.model,
            prompt: chain_prompt
        });
    }

    async answer(input: string) {
        const response = await this.chain.call({ input });
    
        return response.response;
    }
}