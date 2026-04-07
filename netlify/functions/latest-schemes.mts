import { GoogleGenAI, Type } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = Netlify.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { language } = await req.json();

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `List 5 latest Indian gov schemes in ${language} with full details.`,
            },
          ],
        },
      ],
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
              applyLink: { type: Type.STRING },
            },
          },
        } as any,
        tools: [{ googleSearch: {} }],
      },
    });

    return Response.json(JSON.parse(response.text));
  } catch (error: any) {
    console.error("Latest schemes function error:", error);
    return Response.json([], { status: 200 });
  }
};
