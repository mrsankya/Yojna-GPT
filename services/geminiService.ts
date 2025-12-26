
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { UserProfile, ComparisonData, Scheme } from "../types";
import { searchLocalSchemes, getLocalLatestSchemes } from "./localSearchService";

const getApiKey = () => {
  try {
    const key = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
    if (key && key.length > 20) return key;
    return '';
  } catch (e) {
    return '';
  }
};

export async function getSchemeResponse(
  message: string, 
  history: { role: 'user' | 'assistant', content: string }[],
  profile: UserProfile,
  language: string,
  userLocation?: { lat: number, lng: number }
) {
  const isOffline = !navigator.onLine;
  const apiKey = getApiKey();

  if (isOffline || !apiKey) {
    const localResult = searchLocalSchemes(message, language);
    const modeHeader = isOffline ? "⚠️ **Offline Mode Active**" : "⚠️ **Limited Mode (API Key Missing)**";
    return { 
      text: `${modeHeader}\n\n${localResult}`, 
      urls: [] 
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
        systemInstruction: `${SYSTEM_PROMPT}\n\n${profileContext}\n${locationContext}\nCRITICAL: Reply ONLY in ${language}.`,
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
    const localResult = searchLocalSchemes(message, language);
    return { 
      text: `📡 **AI Service Unavailable**\n*Using built-in local data to assist you...*\n\n${localResult}`, 
      urls: [] 
    };
  }
}

export async function compareSchemes(schemeNames: string[], language: string): Promise<ComparisonData> {
  const apiKey = getApiKey();
  if (!apiKey || !navigator.onLine) {
     throw new Error("Local comparison tool is coming soon. Please connect to the internet for AI-powered comparison.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
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
  const apiKey = getApiKey();
  if (!apiKey || !navigator.onLine) {
     return getLocalLatestSchemes(language);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
