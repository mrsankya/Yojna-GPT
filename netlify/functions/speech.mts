import { GoogleGenAI, Modality } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = Netlify.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { text, language } = await req.json();

    // Sanitize text
    let cleanText = text.replace(/https?:\/\/\S+/g, "");
    cleanText = cleanText.replace(/[*_#\[\]()<>`]/g, "");
    cleanText = cleanText.replace(/[^\w\s\.,!?\u0900-\u097F]/gi, "");
    cleanText = cleanText.substring(0, 600).trim();

    if (!cleanText) {
      return Response.json({ audio: null });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this text clearly in ${language}: ${cleanText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return Response.json({ audio: base64Audio || null });
  } catch (error: any) {
    console.error("Speech function error:", error);
    return Response.json({ audio: null });
  }
};
