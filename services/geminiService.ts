
import { UserProfile, ComparisonData, Scheme } from "../types";
import { searchLocalSchemes, getLocalLatestSchemes } from "./localSearchService";

export async function verifyDocument(base64Data: string, mimeType: string) {
  try {
    const response = await fetch("/.netlify/functions/verify-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Data, mimeType }),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Verification Error:", error);
    return null;
  }
}

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
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, profile, language, isWizardMode }),
    });

    const data = await response.json();
    return {
      text: data.text || "I'm sorry, I couldn't process that.",
      urls: data.urls || [],
      suggestions: data.suggestions || [],
      isLimited: data.isLimited || false,
    };
  } catch (error) {
    console.error("Chat Error:", error);
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
    const response = await fetch("/.netlify/functions/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.audio;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

export async function compareSchemes(schemeNames: string[], language: string): Promise<ComparisonData> {
  if (!navigator.onLine) {
     throw new Error("Connect to the internet for AI-powered comparison.");
  }

  const response = await fetch("/.netlify/functions/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schemeNames, language }),
  });

  if (!response.ok) {
    throw new Error("Unable to perform comparison right now.");
  }

  return await response.json();
}

export async function getLatestSchemes(language: string): Promise<Partial<Scheme>[]> {
  if (!navigator.onLine) {
     return getLocalLatestSchemes(language);
  }

  try {
    const response = await fetch("/.netlify/functions/latest-schemes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    });

    if (!response.ok) {
      return getLocalLatestSchemes(language);
    }

    return await response.json();
  } catch (error) {
    return getLocalLatestSchemes(language);
  }
}
