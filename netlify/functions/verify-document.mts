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
    const { base64Data, mimeType } = await req.json();
    const today = new Date().toISOString().split("T")[0];

    const ai = new GoogleGenAI({ apiKey });

    const documentPart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const prompt = `Analyze this Indian government document (Image or PDF).
    1. Identify the Document Type (e.g., Aadhaar, PAN, Ration Card, Income Certificate, Caste Certificate).
    2. Extract the Holder Name.
    3. Extract the Expiry Date (if any specifically mentioned on the document).
    4. Compare with today's date: ${today}.
    5. State if it is currently "valid" or "expired".
    6. Briefly explain your reasoning in the "reason" field.
    Return the result in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [documentPart, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            docType: { type: Type.STRING },
            holderName: { type: Type.STRING },
            expiryDate: { type: Type.STRING, description: "Format YYYY-MM-DD" },
            status: { type: Type.STRING, enum: ["valid", "expired", "unknown"] },
            reason: { type: Type.STRING },
          },
        } as any,
      },
    });

    return Response.json(JSON.parse(response.text));
  } catch (error: any) {
    console.error("Verify document function error:", error);
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
};
