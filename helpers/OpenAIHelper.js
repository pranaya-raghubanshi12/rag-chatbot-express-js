import { OpenAIStream, StreamingTextResponse } from "ai";
import "dotenv/config"
import OpenAI from "openai";

const {
    OPEN_API_KEY
} = process.env;

const openai = new OpenAI({
    apiKey: OPEN_API_KEY
});

export default {
    getVectorFromNewEmbedding: async (input) => {
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input,
            encoding_format: "float"
        })
        return embedding.data[0].embedding;
    },
    createChatCompletionResponseStreamText: async (template, messages) => {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            stream: true,
            messages: [template, ...messages]
        });

        const stream = await OpenAIStream(response);

        let streamResponse = new StreamingTextResponse(stream)
        let responseText = await streamResponse.text();
        return responseText;
    }
}