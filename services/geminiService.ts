import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { Message, ConversationFeedback } from "../types";

// Initialize the API client
// CRITICAL: process.env.API_KEY is assumed to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME_CHAT = 'gemini-3-flash-preview';
const MODEL_NAME_FEEDBACK = 'gemini-3-flash-preview';

/**
 * Creates a new chat session with the specific persona.
 */
export const createChatSession = (systemInstruction: string): Chat => {
  return ai.chats.create({
    model: MODEL_NAME_CHAT,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });
};

/**
 * Sends a message to the chat model and streams the response.
 */
export const sendMessageStream = async (
  chat: Chat,
  message: string,
  onChunk: (text: string) => void
): Promise<string> => {
  let fullResponse = "";
  
  try {
    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      const text = (chunk as GenerateContentResponse).text;
      if (text) {
        fullResponse += text;
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Error streaming message:", error);
    throw error;
  }
  
  return fullResponse;
};

/**
 * Analyzes the conversation history to provide structured feedback.
 */
export const analyzeConversation = async (messages: Message[]): Promise<ConversationFeedback> => {
  const conversationText = messages
    .map(m => `${m.role.toUpperCase()}: ${m.text}`)
    .join('\n');

  const prompt = `
    Analyze the following conversation transcript between a user and an AI role-player.
    Provide constructive feedback to the USER based on their performance.
    
    Transcript:
    ${conversationText}
    
    Return the response in strictly valid JSON format matching this schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME_FEEDBACK,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clarity: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER, description: "Score out of 100" },
                reasoning: { type: Type.STRING, description: "Why this score was given" }
              },
              required: ["score", "reasoning"]
            },
            confidence: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER, description: "Score out of 100" },
                reasoning: { type: Type.STRING, description: "Why this score was given" }
              },
              required: ["score", "reasoning"]
            },
            fillerWords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of filler words used (e.g., um, ah, like)"
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "Original quote from user" },
                  improved: { type: Type.STRING, description: "A better way to say it" },
                  explanation: { type: Type.STRING, description: "Why the improvement is better" }
                },
                required: ["original", "improved", "explanation"]
              }
            },
            overallSummary: { type: Type.STRING, description: "A brief encouraging summary of performance" }
          },
          required: ["clarity", "confidence", "fillerWords", "suggestions", "overallSummary"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No feedback generated");
    
    return JSON.parse(jsonText) as ConversationFeedback;

  } catch (error) {
    console.error("Error generating feedback:", error);
    // Return a fallback error state if API fails
    return {
      clarity: { score: 0, reasoning: "Could not generate analysis." },
      confidence: { score: 0, reasoning: "Could not generate analysis." },
      fillerWords: [],
      suggestions: [],
      overallSummary: "An error occurred while analyzing the conversation. Please try again."
    };
  }
};