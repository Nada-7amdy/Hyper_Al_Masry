import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are the "Royal Concierge" for Hyper Al Masri, an ultra-luxury retail brand inspired by modern Egyptian heritage, black marble, and pure gold. 
Your tone is sophisticated, elegant, polite, and slightly formal, befitting a high-end luxury service.
You assist customers with inquiries about our architectural grandeur, exquisite packaging, and staff attire.
Keep responses concise but evocative. Use words like "opulence", "craftsmanship", "heritage", and "timeless".
If asked about technical details (price, stock), politely suggest visiting our flagship boutique in Cairo.
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
        contents: `Refine the following prompt to create a high-end, photorealistic luxury product image description. 
        It should adhere to a style of "Black marble, gold accents, dramatic lighting, cinematic 8k".
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