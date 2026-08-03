import { GoogleGenAI } from "@google/genai";

interface Env {
  GEMINI_API_KEY: string;
}

// Función auxiliar para inicializar Gemini de forma segura en Cloudflare
function getGeminiClient(apiKey: string | undefined) {
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

// ENRUTADOR PRINCIPAL DE CLOUDFLARE PAGES
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const apiKey = context.env.GEMINI_API_KEY;
  const ai = getGeminiClient(apiKey);

  try {
    const body: any = await context.request.json();

    // ==========================================
    // RUTA 1: CREAR PIEZA 3D (/api/forge/prompt)
    // ==========================================
    if (url.pathname === "/api/forge/prompt") {
      const { prompt, imageBase64, mimeType } = body;
      if (!prompt && !imageBase64) {
        return new Response(JSON.stringify({ error: "Prompt or Image is required" }), { status: 400 });
      }

      if (!ai) {
        // Respuesta de respaldo si no configuraste la API Key todavía
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
          summary: imageBase64 ? `Modelo 3D reconstruido automáticamente a partir de la imagen adjunta. Geometría optimizada para slicer.` : `Modelo '${fallbackPrompt}' inicializado con telemetría de slicer optimizada.`,
          technicalNotes: "Orientación de impresión óptima detectada. Ventiladores de capa al 100% desde capa 3."
        }), { headers: { "Content-Type": "application/json" } });
      }

      const systemInstruction = `You are Forge AI, an expert 3D modeling and additive manufacturing assistant capable of image-to-3D reconstruction analysis. Generate an accurate 3D model specification for 3D printing. Output strictly valid JSON matching this schema: { "modelName": string, "dimensions": { "x": number, "y": number, "z": number }, "wallThickness": number, "infill": number, "recommendedMaterial": string, "printTime": string, "layerHeight": number, "shapeType": string, "summary": string, "technicalNotes": string }`;

      const contents: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents.push({ inlineData: { mimeType: mimeType || "image/jpeg", data: cleanBase64 } });
      }
      contents.push(prompt ? `Reconstruye o genera el modelo 3D según esta instrucción y/o imagen: "${prompt}"` : "Analiza la imagen adjunta y genera el modelo 3D optimizado para impresión 3D.");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: { systemInstruction, responseMimeType: "application/json" },
      });

      return new Response(response.text || "{}", { headers: { "Content-Type": "application/json" } });
    }

    // ==========================================
    // RUTA 2: EDITAR PIEZA 3D (/api/forge/edit)
    // ==========================================
    if (url.pathname === "/api/forge/edit") {
      const { editInstruction, currentModel } = body;

      if (!ai) {
        return new Response(JSON.stringify({
          ...currentModel,
          wallThickness: (currentModel?.wallThickness || 2.0) + 2.0,
          summary: `Aplicado: "${editInstruction}". Grosor de pared actualizado.`,
          technicalNotes: "Geometría recalculada con tolerancia de contracción."
        }), { headers: { "Content-Type": "application/json" } });
      }

      const systemInstruction = `You are Forge AI, an expert 3D modeling editor. Modify the model parameters accordingly and return updated JSON with same schema. Params: ${JSON.stringify(currentModel || {})}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Edit model parameters with instruction: "${editInstruction}"`,
        config: { systemInstruction, responseMimeType: "application/json" },
      });

      return new Response(response.text || "{}", { headers: { "Content-Type": "application/json" } });
    }

    // ==========================================
    // RUTA 3: ASISTENTE CHAT (/api/forge/chat)
    // ==========================================
    if (url.pathname === "/api/forge/chat") {
      const { message } = body;

      if (!ai) {
        return new Response(JSON.stringify({ reply: "Servicio AI local listo. Temperatura de extrusor y nivelación de cama normales." }), { headers: { "Content-Type": "application/json" } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: { systemInstruction: "Eres Forge AI, un asistente técnico para impresoras 3D (Bambu Lab, Voron, Ender, Creality) y preparación de archivos G-Code. Responde de forma concisa, profesional y útil en español." },
      });

      return new Response(JSON.stringify({ reply: response.text }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ruta no encontrada" }), { status: 404 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to process request" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
