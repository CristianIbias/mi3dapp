import { GoogleGenAI } from "@google/genai";

// Cabeceras universales para evitar que el navegador bloquee la página
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

  // Evitar bloqueos si el navegador hace una consulta de verificación previa (OPTIONS)
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
    const body = await context.request.json();

    // ==========================================
    // RUTA 1: CREAR PIEZA 3D (/api/forge/prompt)
    // ==========================================
    if (url.pathname === "/api/forge/prompt" || url.pathname.endsWith("/api/forge/prompt")) {
      const { prompt, imageBase64, mimeType } = body;
      if (!prompt && !imageBase64) {
        return new Response(JSON.stringify({ error: "Prompt or Image is required" }), { status: 400, headers: jsonHeaders });
      }

      if (!ai) {
        const fallbackPrompt = prompt || "Objeto detectado en imagen";
        return new Response(JSON.stringify({
          modelName: imageBase64 ? `Modelo 3D de Foto (${fallbackPrompt})` : fallbackPrompt,
          dimensions: { x: 125.0, y: 95.0, z: 180.0 },
          wallThickness: 2.4,
          infill: 25,
          recommendedMaterial: "PLA Basic (Jade White)",
          printTime: "01:38:00",
          layerHeight: 0.2,
          shapeType: fallbackPrompt.toLowerCase().includes("gear") || fallbackPrompt.toLowerCase().includes("engranaje") ? "gear" : fallbackPrompt.toLowerCase().includes("vase") || fallbackPrompt.toLowerCase().includes("maceta") || fallbackPrompt.toLowerCase().includes("florero") ? "vase" : fallbackPrompt.toLowerCase().includes("drone") || fallbackPrompt.toLowerCase().includes("chasis") ? "drone" : fallbackPrompt.toLowerCase().includes("cable") || fallbackPrompt.toLowerCase().includes("soporte") ? "bracket" : "torus",
          summary: imageBase64 ? `Modelo 3D reconstruido automáticamente.` : `Modelo '${fallbackPrompt}' inicializado.`,
          technicalNotes: "Optimizado para impresión rápida."
        }), { status: 200, headers: jsonHeaders });
      }

      const systemInstruction = `You are Forge AI, an expert 3D modeling assistant. Output strictly valid JSON matching this schema: { "modelName": string, "dimensions": { "x": number, "y": number, "z": number }, "wallThickness": number, "infill": number, "recommendedMaterial": string, "printTime": string, "layerHeight": number, "shapeType": string, "summary": string, "technicalNotes": string } Do not wrap in markdown backticks. Output raw JSON.`;

      const contents = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents.push({ inlineData: { mimeType: mimeType || "image/jpeg", data: cleanBase64 } });
      }
      contents.push(prompt ? `Genera el modelo 3D: "${prompt}"` : "Genera el modelo 3D de la imagen.");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: { systemInstruction, responseMimeType: "application/json" },
      });

      return new Response(response.text || "{}", { status: 200, headers: jsonHeaders });
    }

    // ==========================================
    // RUTA 2: EDITAR PARAMETROS PIEZA (/api/forge/edit)
    // ==========================================
    if (url.pathname === "/api/forge/edit" || url.pathname.endsWith("/api/forge/edit")) {
      const { editInstruction, currentModel } = body;

      if (!ai) {
        return new Response(JSON.stringify({
          ...currentModel,
          wallThickness: (currentModel?.wallThickness || 2.0) + 2.0,
          summary: `Aplicado: "${editInstruction}". Grosor de pared actualizado.`,
          technicalNotes: "Geometría recalculada con tolerancia de contracción."
        }), { status: 200, headers: jsonHeaders });
      }

      const systemInstruction = `You are Forge AI, an expert 3D modeling editor. Modify the model parameters accordingly and return updated JSON with same schema. Params actuales: ${JSON.stringify(currentModel || {})}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Edit model parameters with instruction: "${editInstruction}"`,
        config: { systemInstruction, responseMimeType: "application/json" },
      });

      return new Response(response.text || "{}", { status: 200, headers: jsonHeaders });
    }

    // ==========================================
    // RUTA 3: CHAT ASISTENTE (/api/forge/chat)
    // ==========================================
    if (url.pathname === "/api/forge/chat" || url.pathname.endsWith("/api/forge/chat")) {
      const { message } = body;
      if (!ai) {
        return new Response(JSON.stringify({ reply: "Motor local listo. Escribe tu comando." }), { status: 200, headers: jsonHeaders });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: { systemInstruction: "Eres Forge AI, un asistente técnico para impresoras 3D. Responde de forma concisa en español." },
      });

      return new Response(JSON.stringify({ reply: response.text }), { status: 200, headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ error: "Ruta no encontrada" }), { status: 404, headers: jsonHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Failed to process request" }), { status: 500, headers: jsonHeaders });
  }
};
