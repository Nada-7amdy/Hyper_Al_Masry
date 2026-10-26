import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are the smart, helpful Assistant for Hyper Al Masri, a modern, highly efficient fresh food and hypermarket brand.
Your tone is friendly, warm, quick with assistance, and focused on helping families find the freshest options and smartest savings.
You answer questions about our fresh farm pickings, eco-friendly packaging, and advanced barcode scanning/weighing solutions.
Keep responses concise, energetic, and highly readable in Arabic and English. Use words like "freshness", "smart savings", "fast-checkout", and "healthy home".
`;

export const sendMessageToConcierge = async (
  history: ChatMessage[], 
  newMessage: string
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct history for the stateless generateContent call or use chat session
    // For simplicity in this demo, we'll use a chat session structure
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I apologize, but I am currently attending to another guest. Please try again momentarily.";
  } catch (error) {
    console.error("Concierge Error:", error);
    return "My deepest apologies, there seems to be a disturbance in our communications.";
  }
};

