
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { UserProfile, ComparisonData, Scheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSchemeResponse(
  message: string, 
  history: { role: 'user' | 'assistant', content: string }[],
  profile: UserProfile,
  userLocation?: { lat: number, lng: number }
) {
  const profileContext = `User Profile Context: ${JSON.stringify(profile)}`;
  const locationContext = userLocation ? `User Lat/Lng: ${userLocation.lat}, ${userLocation.lng}` : '';

  const contents = [
    ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\n${profileContext}\n${locationContext}`,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const urls = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Gov Source',
      uri: chunk.web?.uri || '#'
    })).filter((u: any) => u.uri !== '#');

    return { text, urls };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function compareSchemes(schemeNames: string[], language: string): Promise<ComparisonData> {
  const prompt = `Compare the following two Indian government schemes in detail: ${schemeNames.join(' and ')}. 
  Return the response in ${language}. Ensure the links are accurate and current using Google Search.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      schemeA: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          provider: { type: Type.STRING },
          description: { type: Type.STRING },
          benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
          eligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
          documents: { type: Type.ARRAY, items: { type: Type.STRING } },
          applyLink: { type: Type.STRING },
        },
        required: ["name", "provider", "benefits", "eligibility", "documents", "applyLink"]
      },
      schemeB: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          provider: { type: Type.STRING },
          description: { type: Type.STRING },
          benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
          eligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
          documents: { type: Type.ARRAY, items: { type: Type.STRING } },
          applyLink: { type: Type.STRING },
        },
        required: ["name", "provider", "benefits", "eligibility", "documents", "applyLink"]
      },
      summary: { type: Type.STRING, description: "A brief side-by-side analysis of key differences." }
    },
    required: ["schemeA", "schemeB", "summary"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an expert in Indian government policies. Return structured JSON data for comparison. Use Google Search to verify latest data.",
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
        tools: [{ googleSearch: {} }]
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Comparison Error:", error);
    throw error;
  }
}

export async function getLatestSchemes(language: string): Promise<Partial<Scheme>[]> {
  const prompt = `List 5 NEWLY introduced Indian government schemes (Central or State) from late 2024 or 2025. 
  For each scheme, provide its name, a short description, key benefits, and SPECIFIC REQUIRED DOCUMENTS. 
  Translate all content to ${language}. Use Google Search grounding for latest data.`;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        provider: { type: Type.STRING },
        description: { type: Type.STRING },
        benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
        documents: { type: Type.ARRAY, items: { type: Type.STRING } },
        applyLink: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["name", "provider", "description", "benefits", "documents", "applyLink"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a policy analyst tracking new Indian government initiatives. Use Google Search grounding to ensure real-time accuracy.",
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
        tools: [{ googleSearch: {} }]
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Latest Schemes Error:", error);
    throw error;
  }
}
