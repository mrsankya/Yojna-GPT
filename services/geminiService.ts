
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { UserProfile, ComparisonData, Scheme } from "../types";
import { searchLocalSchemes, getLocalLatestSchemes } from "./localSearchService";

export async function getSchemeResponse(
  message: string, 
  history: { role: 'user' | 'assistant', content: string }[],
  profile: UserProfile,
  language: string,
  userLocation?: { lat: number, lng: number }
) {
  const isOffline = !navigator.onLine;

  if (isOffline) {
    const localResult = searchLocalSchemes(message, language);
    return { 
      text: localResult, 
      urls: [],
      isLimited: true
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const profileContext = `User Profile Context: ${JSON.stringify(profile)}`;
    const locationContext = userLocation ? `User Lat/Lng: ${userLocation.lat}, ${userLocation.lng}` : '';
    
    const contents = [
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\n${profileContext}\n${locationContext}\nCRITICAL: Reply ONLY in ${language}. You are a helpful AI bot. If the user says hi/hello/namaste, greet them warmly and ask how you can help with government schemes.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const urls = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Gov Source',
      uri: chunk.web?.uri || '#'
    })).filter((u: any) => u.uri !== '#');

    return { text, urls, isLimited: false };
  } catch (error) {
    console.error("Gemini Error:", error);
    // Only return local search as a last resort if API fails
    const localResult = searchLocalSchemes(message, language);
    return { 
      text: localResult, 
      urls: [],
      isLimited: true 
    };
  }
}

export async function compareSchemes(schemeNames: string[], language: string): Promise<ComparisonData> {
  if (!navigator.onLine) {
     throw new Error("Local comparison tool is coming soon. Please connect to the internet for AI-powered comparison.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: `Compare: ${schemeNames.join(' and ')}. Output JSON in ${language}.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schemeA: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, provider: {type: Type.STRING}, benefits: {type: Type.ARRAY, items: {type: Type.STRING}}, eligibility: {type: Type.ARRAY, items: {type: Type.STRING}}, documents: {type: Type.ARRAY, items: {type: Type.STRING}}, applyLink: {type: Type.STRING} } },
            schemeB: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, provider: {type: Type.STRING}, benefits: {type: Type.ARRAY, items: {type: Type.STRING}}, eligibility: {type: Type.ARRAY, items: {type: Type.STRING}}, documents: {type: Type.ARRAY, items: {type: Type.STRING}}, applyLink: {type: Type.STRING} } },
            summary: { type: Type.STRING }
          }
        } as any,
        tools: [{ googleSearch: {} }]
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    throw new Error("Unable to perform comparison right now. Please check your internet connection.");
  }
}

export async function getLatestSchemes(language: string): Promise<Partial<Scheme>[]> {
  if (!navigator.onLine) {
     return getLocalLatestSchemes(language);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: `List 5 latest Indian gov schemes in ${language}.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              provider: { type: Type.STRING },
              benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
              documents: { type: Type.ARRAY, items: { type: Type.STRING } },
              applyLink: { type: Type.STRING }
            }
          }
        } as any,
        tools: [{ googleSearch: {} }]
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    return getLocalLatestSchemes(language);
  }
}
