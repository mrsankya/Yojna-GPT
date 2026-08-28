import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_PROMPT = `
You are YojnaGPT, a specialized multilingual AI assistant for Indian Government Schemes.

CONVERSATIONAL RULES:
1. **Handle Greetings Naturally**: If the user says "Hi", "Hello", "Namaste", or similar greetings, DO NOT dump a list of schemes. Respond warmly, acknowledge their name (from context), and ask how you can assist them with government schemes today.
2. **Contextual Relevance**: Only provide detailed scheme information when the user explicitly asks for help finding schemes, asks about a specific scheme, or asks "what am I eligible for?".
3. **Identity**: Your name is YojnaGPT. You help Indian citizens navigate welfare programs.
4. **Suggestions**: At the end of every response, you MUST provide exactly 3 short, relevant follow-up questions the user might want to ask next. Format them as: [SUGGESTIONS: Q1, Q2, Q3]. Keep each suggestion under 10 words.

CORE MISSION (When requested):
Provide comprehensive, structured, and actionable information about welfare schemes.
When discussing a scheme, you MUST extract and present:
1. **Benefits**: Clear bullet points of exactly what the citizen receives.
2. **Eligibility**: Specific criteria including age, income limits, category, and state.
3. **Documents Required**: A definitive checklist of necessary paperwork.
4. **Application Process**: A simple step-by-step guide.
5. **Official Links**: Provide verified .gov.in or .nic.in URLs.
6. **Video Tutorial**: Provide a YouTube link for "How to apply for [scheme name]".

STRICT ACCURACY RULES:
1. SOURCE VERIFICATION: Prioritize official government domains.
2. CITATION: Use grounding metadata for links.
3. FORMATTING: Use Markdown (bolding, headers) for readability.
4. LANGUAGE: Respond natively in the user's chosen language.

If information is missing, say: "Official confirmation for [specific detail] is currently being updated on the portal."
`;

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = Netlify.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { message, history, profile, language, isWizardMode } = body;

    const ai = new GoogleGenAI({ apiKey });
    const profileContext = `User Profile Context: ${JSON.stringify(profile)}`;
    const identityEnforcement = `The current user is named ${profile?.fullName || "Citizen"}.`;

    const wizardInstruction = isWizardMode
      ? `\n\nCRITICAL: ELIGIBILITY WIZARD MODE IS ACTIVE.
         1. Do NOT provide a list of schemes immediately.
         2. Instead, look at the User Profile Context and identify missing or vague information.
         3. Ask EXACTLY ONE short question to the user to gather a specific detail needed for eligibility.
         4. After the user answers 3-4 questions, or if you have enough data, provide the final tailored recommendations.
         5. Keep the conversation flow natural like a helpful officer.`
      : "";

    const contents = [
      ...(history || []).map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents as any,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\n${profileContext}\n${identityEnforcement}\n${wizardInstruction}\n\nREPLY IN ${language}. If the user just says "Hi" or "Hello", greet them back warmly and ask how to help. ONLY recommend or list schemes if the user asks for suggestions, asks "what am I eligible for?", or mentions a topic like education/farming.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text || "I'm sorry, I couldn't process that.";

    // Extract Suggestions
    const suggestionMatch = rawText.match(/\[SUGGESTIONS: (.*?)\]/i);
    let suggestions: string[] = [];
    let text = rawText;

    if (suggestionMatch) {
      suggestions = suggestionMatch[1]
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
      text = rawText.replace(/\[SUGGESTIONS: .*?\]/i, "").trim();
    }

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    const urls = groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Resource Link",
        uri: chunk.web?.uri || "#",
      }))
      .filter((u: any) => {
        if (u.uri === "#") return false;
        const uri = u.uri.toLowerCase();
        const isGov =
          uri.includes(".gov.in") ||
          uri.includes(".nic.in") ||
          uri.includes(".in");
        const isYoutube =
          uri.includes("youtube.com") || uri.includes("youtu.be");
        return isGov || isYoutube;
      });

    return Response.json({ text, urls: urls || [], suggestions, isLimited: false });
  } catch (error: any) {
    console.error("Chat function error:", error);
    return Response.json(
      { text: "issue with server you can ask me only yojna (schemes)", urls: [], suggestions: [], isLimited: true },
      { status: 200 }
    );
  }
};
