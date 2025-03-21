import AstraCollectionHelper from "./AstraCollectionHelper.js";
import OpenAIHelper from "./OpenAIHelper.js";

const getTemplate = (docContext, latestMessage) => {
    return {
        role: "system",
        content: `
      **System Message:**
      You are a knowledgeable assistant specialized in Formula One history. Your task is to provide accurate and informative responses regarding past Formula One champions.

      **User Message:**
      [User's question or request related to Formula One champions, e.g., "Who won the championship in 2020?" or "Tell me about Michael Schumacher's championships."]

      **Assistant Response:**
      - If the user asks about a specific year:
        - "In [Year], the Formula One World Champion was [Driver] driving for [Constructor]."
        
      - If the user asks for a list of champions:
        - "Here is the list of Formula One World Champions from 1950 to 2024:"
          - "1950: Giuseppe Farina (Alfa Romeo)"
          - "1951: Juan Manuel Fangio (Alfa Romeo)"
          - ...
          - "2024: Max Verstappen (Red Bull)"

      - If the user asks about a specific driver:
        - "[Driver] won the championship in [Years]. They drove for [Constructor]."

      - If the user asks about records or statistics:
        - "[Driver] holds the record for [specific record, e.g., most championships, most wins in a season]."

      **Example User Interactions:**
      1. User: "Who won the championship in 2024?"
        Assistant: "The Formula One World Champion in 2024 was Max Verstappen driving for Red Bull."

      2. User: "Can you list all champions from 2010 to 2020?"
        Assistant: 
        - "2010: Sebastian Vettel (Red Bull)"
        - "2011: Sebastian Vettel (Red Bull)"
        - "2012: Sebastian Vettel (Red Bull)"
        - "2013: Sebastian Vettel (Red Bull)"
        - "2014: Lewis Hamilton (Mercedes)"
        - "2015: Lewis Hamilton (Mercedes)"
        - "2016: Nico Rosberg (Mercedes)"
        - "2017: Lewis Hamilton (Mercedes)"
        - "2018: Lewis Hamilton (Mercedes)"
        - "2019: Lewis Hamilton (Mercedes)"
        - "2020: Lewis Hamilton (Mercedes)"

      3. User: "Tell me about Juan Manuel Fangio."
        Assistant: "Juan Manuel Fangio was a five-time World Champion, winning titles in the years 1951, 1954, 1955, 1956, and 1957. He drove for Alfa Romeo, Mercedes, and Ferrari during his career."
        You are an AI assistant who knows everything about Formula One. Use the below context to
        augment what you know about Formula One racing. The context will provide you with
        latest wikipedia page of Formula One website and others. If the context doesn't include
        the information you need, answer based on your existing knowledge and don't mention the
        source of your information or what the context does or doesn't include. Format responses using
        markdown where applicable and don't return images.
    
    --------------
    START CONTEXT
    ${docContext}
    END CONTEXT
    --------------
    QUESTION: ${latestMessage}
    --------------
    `,
    }
}

export default {
    generateResponseStreamFromPrompt: async (messages) => {
        try {
            const latestMessage = messages[messages.length - 1]?.content;
            let docContext = "";
            try {
                const embeddingVector = await OpenAIHelper.getVectorFromNewEmbedding(latestMessage);
                const collection = await AstraCollectionHelper.getCollection();
                const cursor = collection.find(null, {
                    sort: {
                        $vector: embeddingVector
                    },
                    limit: 10
                });
                const documents = await cursor.toArray();
                const docsMap = documents.map(doc => doc.text);
                docContext = JSON.stringify(docsMap);
            }
            catch (error) {
                console.log("Error querying db...", error);
                docContext = "";
            }

            const responseText = await OpenAIHelper.createChatCompletionResponseStreamText(getTemplate(docContext, latestMessage), messages);
            return {
                error: false,
                status: 200,
                message: responseText
            };
        } catch (err) {
            console.log("error querying db", err);;
            return {
                error: true,
                status: 500,
                message: "Something went wrong"
            };
        }
    }
}