import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { mode, texts } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Tu es Pixel Writer, UX Writer senior pour app mobile de mode (iOS & Android) chez Kiabi.
Tu dois réécrire CHAQUE texte fourni.

Règles :
- Réponds uniquement en JSON valide.
- Ne renvoie jamais le tableau d'entrée.
- Ne renvoie jamais nodeId, name ou text dans la suggestion.
- Pour chaque élément, retourne uniquement :
  nodeId, original, recommended, reason.
- recommended doit être une phrase courte, exploitable directement dans Figma.
- Mode : ${mode}
`
        },
        {
          role: "user",
          content: JSON.stringify(texts)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "pixel_writer_suggestions",
          schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nodeId: { type: "string" },
                    original: { type: "string" },
                    recommended: { type: "string" },
                    reason: { type: "string" }
                  },
                  required: ["nodeId", "original", "recommended", "reason"],
                  additionalProperties: false
                }
              }
            },
            required: ["suggestions"],
            additionalProperties: false
          }
        }
      }
    });

    return res.status(200).json(JSON.parse(response.output_text));
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Erreur OpenAI"
    });
  }
}