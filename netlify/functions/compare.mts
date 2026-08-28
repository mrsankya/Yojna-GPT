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
    const { schemeNames, language } = await req.json();

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Compare ${schemeNames.join(" and ")}. Output JSON in ${language} with Benefits, Eligibility, and Documents.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schemeA: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                provider: { type: Type.STRING },
                benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                eligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
                documents: { type: Type.ARRAY, items: { type: Type.STRING } },
                applyLink: { type: Type.STRING },
              },
            },
            schemeB: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                provider: { type: Type.STRING },
                benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                eligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
                documents: { type: Type.ARRAY, items: { type: Type.STRING } },
                applyLink: { type: Type.STRING },
              },
            },
            summary: { type: Type.STRING },
          },
        } as any,
        tools: [{ googleSearch: {} }],
      },
    });

    return Response.json(JSON.parse(response.text));
  } catch (error: any) {
    console.error("Compare function error:", error);
    return Response.json({ error: "Unable to perform comparison right now." }, { status: 500 });
  }
};
