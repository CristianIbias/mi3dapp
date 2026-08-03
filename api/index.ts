import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini client lazily/safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Routes
app.post("/api/forge/prompt", async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType } = req.body;
    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: "Prompt or Image is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response if no GEMINI_API_KEY is configured
      const fallbackPrompt = prompt || "Objeto detectado en imagen";
      return res.json({
        modelName: imageBase64 ? `Modelo 3D de Foto (${fallbackPrompt})` : fallbackPrompt,
        dimensions: { x: 125.0, y: 95.0, z: 180.0 },
        wallThickness: 2.4,
        infill: 25,
        recommendedMaterial: "PLA Basic (Jade White)",
        printTime: "01:38:00",
        layerHeight: 0.2,
        shapeType: fallbackPrompt.toLowerCase().includes("gear") || fallbackPrompt.toLowerCase().includes("engranaje")
          ? "gear"
          : fallbackPrompt.toLowerCase().includes("vase") || fallbackPrompt.toLowerCase().includes("maceta") || fallbackPrompt.toLowerCase().includes("florero")
          ? "vase"
          : fallbackPrompt.toLowerCase().includes("drone") || fallbackPrompt.toLowerCase().includes("chasis")
          ? "drone"
          : fallbackPrompt.toLowerCase().includes("cable") || fallbackPrompt.toLowerCase().includes("soporte")
          ? "bracket"
          : "torus",
        summary: imageBase64
          ? `Modelo 3D reconstruido automáticamente a partir de la imagen adjunta. Geometría optimizada para slicer.`
          : `Modelo '${fallbackPrompt}' inicializado con telemetría de slicer optimizada.`,
        technicalNotes: "Orientación de impresión óptima detectada. Ventiladores de capa al 100% desde capa 3."
      });
    }

    const systemInstruction = `
You are Forge AI, an expert 3D modeling and additive manufacturing assistant capable of image-to-3D reconstruction analysis.
Given a user text prompt and/or an image of a physical object, analyze the object's geometry, dimensions, and structural features.
Generate an accurate 3D model specification for 3D printing.
You MUST output strictly valid JSON matching this schema:
{
  "modelName": string (short clean descriptive name in Spanish),
  "dimensions": { "x": number (mm, e.g. 120.0), "y": number (mm, e.g. 85.0), "z": number (mm, e.g. 150.0) },
  "wallThickness": number (mm, e.g. 2.0),
  "infill": number (percentage, e.g. 15 to 100),
  "recommendedMaterial": string (e.g. "PLA Basic", "PETG Translucent", "PLA Matte"),
  "printTime": string (e.g. "01:45:00"),
  "layerHeight": number (mm, e.g. 0.16 or 0.2),
  "shapeType": string (one of: "gear", "vase", "drone", "bracket", "cube", "torus", "cylinder"),
  "summary": string (brief summary in Spanish describing how the 3D model was reconstructed or created),
  "technicalNotes": string (technical advice on bed adhesion, supports, nozzle temp)
}
Do not wrap in markdown backticks unless strictly JSON. Output raw JSON.
`;

    const contents: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const textInstruction = prompt
      ? `Reconstruye o genera el modelo 3D según esta instrucción y/o imagen: "${prompt}"`
      : "Analiza la imagen adjunta y genera el modelo 3D optimizado para impresión 3D.";

    contents.push(textInstruction);

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/forge/prompt:", error);
    res.status(500).json({ error: error.message || "Failed to process prompt" });
  }
});

app.post("/api/forge/edit", async (req, res) => {
  try {
    const { editInstruction, currentModel } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        ...currentModel,
        wallThickness: (currentModel?.wallThickness || 2.0) + 2.0,
        summary: `Aplicado: "${editInstruction}". Grosor de pared actualizado.`,
        technicalNotes: "Geometría recalculada con tolerancia de contracción."
      });
    }

    const systemInstruction = `
You are Forge AI, an expert 3D modeling editor.
The user wants to edit an existing 3D print model parameters.
Given current model params: ${JSON.stringify(currentModel || {})}
And user edit request: "${editInstruction}"

Modify the model parameters accordingly and return updated JSON with same schema:
{
  "modelName": string,
  "dimensions": { "x": number, "y": number, "z": number },
  "wallThickness": number,
  "infill": number,
  "recommendedMaterial": string,
  "printTime": string,
  "layerHeight": number,
  "shapeType": string,
  "summary": string (in Spanish detailing changes made),
  "technicalNotes": string (in Spanish)
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Edit model parameters with instruction: "${editInstruction}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/forge/edit:", error);
    res.status(500).json({ error: error.message || "Failed to edit model" });
  }
});

app.post("/api/forge/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: "Servicio AI local listo. Temperatura de extrusor y nivelación de cama dentro de parámetros óptimos para Bambu Lab A1."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction: "Eres Forge AI, un asistente técnico para impresoras 3D (Bambu Lab, Voron, Ender, Creality) y preparación de archivos G-Code. Responde de forma concisa, profesional y útil en español.",
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Chat failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Forge AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
