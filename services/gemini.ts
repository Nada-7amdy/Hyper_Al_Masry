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

export const generateLuxuryConcept = async (prompt: string): Promise<string | null> => {
  try {
    // We want to generate an image based on the user's prompt
    // First, let's refine the prompt to ensure it matches the brand aesthetic
    const refineModel = 'gemini-3-flash-preview';
    const refinementResponse = await ai.models.generateContent({
        model: refineModel,
        contents: `Refine the following prompt to create a highly appealing, modern hypermarket product display description in dark mode. 
        It should adhere to a style of "Fresh food product, dark sleek background, vivid neon green ambient lighting, clean and professional, cinematic 8k".
        The user's input is: "${prompt}".
        Return ONLY the refined prompt text.`,
    });
    
    const refinedPrompt = refinementResponse.text || prompt;

    // Now generate the image
    const imageModel = 'gemini-2.5-flash-image';
    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [
          { text: refinedPrompt }
        ]
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Design Atelier Error:", error);
    return null;
  }
};