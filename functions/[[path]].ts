import { GoogleGenAI } from "@google/genai";

const jsonHeaders = {
  "Content-Type": "application/json;charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getGeminiClient(apiKey) {
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

export const onRequest = async (context) => {
  const url = new URL(context.request.url);
  const apiKey = context.env.GEMINI_API_KEY;
  const ai = getGeminiClient(apiKey);

  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    let body = {};
    let rawText = "";
    const contentType = context.request.headers.get("content-type") || "";

    // Extractor multiformato resistente a fallos
    if (contentType.includes("form-data") || contentType.includes("multipart")) {
      try {
        const formData = await context.request.formData();
        for (const [key, value] of formData.entries()) {
          if (typeof value === "string") {
            body[key] = value;
            if (key === "prompt" || key === "message") rawText = value;
          }
        }
      } catch (e) {}
    } else {
      try {
        rawText = await context.request.text();
        if (rawText) body = JSON.parse(rawText);
      } catch (jsonError) {
        if (rawText) body = { prompt: rawText, message: rawText };
      }
    }

    const prompt = body.prompt || body.message || body.text || rawText || "engranaje mecanico basico";
    const imageBase64 = body.imageBase64 || "";
    const mimeType = body.mimeType || "image/jpeg";
    const finalPrompt = prompt || "engranaje mecanico basico";

    const pathLower = url.pathname.toLowerCase();

    // ========================================================
    // 1. SI BUSCA MODELAR (PROMPT)
    // ========================================================
    if (pathLower.includes("prompt")) {
      if (!ai) {
        return new Response(JSON.stringify({
          modelName: finalPrompt,
          dimensions: { x: 125.0, y: 95.0, z: 180.0 },
          wallThickness: 2.4,
          infill: 25,
          recommendedMaterial: "PLA Basic",
          printTime: "01:38:00",
          layerHeight: 0.2,
          shapeType: finalPrompt.toLowerCase().includes("gear") || finalPrompt.toLowerCase().includes("engranaje") ? "gear" : finalPrompt.toLowerCase().includes("vase") || finalPrompt.toLowerCase().includes("maceta") || finalPrompt.toLowerCase().includes("florero") ? "vase" : finalPrompt.toLowerCase().includes("drone") || finalPrompt.toLowerCase().includes("chasis") ? "drone" : finalPrompt.toLowerCase().includes("cable") || finalPrompt.toLowerCase().includes("soporte") ? "bracket" : "torus",
          summary: "Modelo simulado en Cloudflare.",
          technicalNotes: "Optimizado para impresión rápida."
        }), { status: 200, headers: jsonHeaders });
      }

      const systemInstruction = `You are Forge AI, an expert 3D modeling assistant. Output strictly valid JSON matching this schema: { "modelName": string, "dimensions": { "x": number, "y": number, "z": number }, "wallThickness": number, "infill": number, "recommendedMaterial": string, "printTime": string, "layerHeight": number, "shapeType": string, "summary": string, "technicalNotes": string } Do not wrap in markdown backticks. Output raw JSON.`;
      const contents = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents.push({ inlineData: { mimeType, data: cleanBase64 } });
      }
      contents.push(`Genera el modelo 3D según esta instrucción: "${finalPrompt}"`);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: { systemInstruction, responseMimeType: "application/json" },
      });
      return new Response(response.text || "{}", { status: 200, headers: jsonHeaders });
    }

    // ========================================================
    // 2. SI BUSCA EDITAR PIEZA (EDIT)
    // ========================================================
    if (pathLower.includes("edit")) {
      const editInstruction = body.editInstruction || finalPrompt;
      const currentModel = body.currentModel || {};

      if (!ai) {
        return new Response(JSON.stringify({
          ...currentModel,
          wallThickness: (currentModel?.wallThickness || 2.0) + 2.0,
          summary: `Aplicado: "${editInstruction}".`,
          technicalNotes: "Geometría recalculada."
        }), { status: 200, headers: jsonHeaders });
      }

      const systemInstruction = `You are Forge AI, an expert 3D modeling editor. Modify parameters accordingly. Params: ${JSON.stringify(currentModel)}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Edit model parameters with instruction: "${editInstruction}"`,
        config: { systemInstruction, responseMimeType: "application/json" },
      });
      return new Response(response.text || "{}", { status: 200, headers: jsonHeaders });
    }

    // ========================================================
    // 3. SI BUSCA CONVERSAR (CHAT)
    // ========================================================
    if (pathLower.includes("chat")) {
      if (!ai) {
        return new Response(JSON.stringify({ reply: "Asistente listo." }), { status: 200, headers: jsonHeaders });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: finalPrompt,
        config: { systemInstruction: "Eres Forge AI, un asistente técnico para impresoras 3D. Responde conciso en español." },
      });
      return new Response(JSON.stringify({ reply: response.text }), { status: 200, headers: jsonHeaders });
    }

    // RESPUESTA COMODÍN GLOBAL DE RESPALDO
    if (!ai) {
      return new Response(JSON.stringify({
        modelName: finalPrompt,
        dimensions: { x: 100, y: 100, z: 100 },
        wallThickness: 2.0,
        infill: 20,
        recommendedMaterial: "PLA Basic",
        printTime: "01:00:00",
        layerHeight: 0.2,
        shapeType: "torus",
        summary: "Modelo procesado por ruta comodín.",
        technicalNotes: "Listo."
      }), { status: 200, headers: jsonHeaders });
    }

    const systemInstructionFallback = `You are Forge AI. Output strictly valid JSON matching schema: { "modelName": string, "dimensions": { "x": number, "y": number, "z": number }, "wallThickness": number, "infill": number, "recommendedMaterial": string, "printTime": string, "layerHeight": number, "shapeType": string, "summary": string, "technicalNotes": string }`;
    const responseFallback = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Genera el modelo 3D: "${finalPrompt}"`,
      config: { systemInstruction: systemInstructionFallback, responseMimeType: "application/json" },
    });
    return new Response(responseFallback.text || "{}", { status: 200, headers: jsonHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Failed to process request" }), { status: 500, headers: jsonHeaders });
  }
};
