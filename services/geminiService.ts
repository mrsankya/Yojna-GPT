
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { UserProfile, ComparisonData, Scheme } from "../types";
import { searchLocalSchemes, getLocalLatestSchemes } from "./localSearchService";

export async function getSchemeResponse(
  message: string, 
  history: { role: 'user' | 'assistant', content: string }[],
  profile: UserProfile,
  language: string,
  isWizardMode: boolean = false,
  userLocation?: { lat: number, lng: number }
) {
  const isOffline = !navigator.onLine;

  if (isOffline) {
    const localResult = searchLocalSchemes(message, language);
    return { 
      text: localResult, 
      urls: [],
      suggestions: [],
      isLimited: true
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const profileContext = `User Profile Context: ${JSON.stringify(profile)}`;
    const locationContext = userLocation ? `User Lat/Lng: ${userLocation.lat}, ${userLocation.lng}` : '';
    const identityEnforcement = `The current user is named ${profile.fullName}.`;
    
    // Define Wizard Logic
    const wizardInstruction = isWizardMode 
      ? `\n\nCRITICAL: ELIGIBILITY WIZARD MODE IS ACTIVE. 
         1. Do NOT provide a list of schemes immediately.
         2. Instead, look at the User Profile Context and identify missing or vague information (e.g., specific occupation detail, exact annual income, or specific category).
         3. Ask EXACTLY ONE short question to the user to gather a specific detail needed for eligibility.
         4. After the user answers 3-4 questions, or if you have enough data, provide the final tailored recommendations.
         5. Keep the conversation flow natural like a helpful officer.`
      : "";

    const contents = [
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\n${profileContext}\n${locationContext}\n${identityEnforcement}\n${wizardInstruction}\n\nREPLY IN ${language}. If the user just says "Hi" or "Hello", greet them back warmly and ask how to help. ONLY recommend or list schemes if the user asks for suggestions, asks "what am I eligible for?", or mentions a topic like education/farming.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text || "I'm sorry, I couldn't process that.";
    
    // Extract Suggestions
    const suggestionMatch = rawText.match(/\[SUGGESTIONS: (.*?)\]/i);
    let suggestions: string[] = [];
    let text = rawText;
    
    if (suggestionMatch) {
      suggestions = suggestionMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
      text = rawText.replace(/\[SUGGESTIONS: .*?\]/i, '').trim();
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const urls = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Resource Link',
      uri: chunk.web?.uri || '#'
    })).filter((u: any) => {
        if (u.uri === '#') return false;
        const uri = u.uri.toLowerCase();
        const isGov = uri.includes('.gov.in') || uri.includes('.nic.in') || uri.includes('.in');
        const isYoutube = uri.includes('youtube.com') || uri.includes('youtu.be');
        return isGov || isYoutube;
    });

    return { text, urls, suggestions, isLimited: false };
  } catch (error) {
    console.error("Gemini Error:", error);
    const localResult = searchLocalSchemes(message, language);
    return { 
      text: localResult, 
      urls: [],
      suggestions: [],
      isLimited: true 
    };
  }
}

export async function generateSpeech(text: string, language: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Aggressive sanitization to prevent 500 errors
    let cleanText = text.replace(/https?:\/\/\S+/g, '');
    cleanText = cleanText.replace(/[*_#\[\]()<>`]/g, '');
    cleanText = cleanText.replace(/[^\w\s\.,!?\u0900-\u097F]/gi, ''); 
    cleanText = cleanText.substring(0, 600).trim();
    
    if (!cleanText) return null;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this text clearly in ${language}: ${cleanText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

export async function compareSchemes(schemeNames: string[], language: string): Promise<ComparisonData> {
  if (!navigator.onLine) {
     throw new Error("Connect to the internet for AI-powered comparison.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: `Compare ${schemeNames.join(' and ')}. Output JSON in ${language} with Benefits, Eligibility, and Documents.` }] }],
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
    throw new Error("Unable to perform comparison right now.");
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
      contents: [{ role: 'user', parts: [{ text: `List 5 latest Indian gov schemes in ${language} with full details.` }] }],
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
