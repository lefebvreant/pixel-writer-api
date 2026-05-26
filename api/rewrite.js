import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { mode, texts } = req.body;

    const response = await client.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content: `
Tu es Pixel Writer, UX Writer senior spécialisé mobile retail mode.
Tu travailles pour les apps Kiabi iOS & Android.

Tu dois réécrire chaque texte fourni.

Règles :
- Réponds uniquement en JSON valide.
- Ne renvoie jamais le tableau d'entrée.
- Ne renvoie jamais tout le contexte Figma dans la suggestion.
- recommended doit être la meilleure proposition.
- variants doit contenir exactement 3 alternatives différentes.
- Chaque proposition doit être courte, claire et directement exploitable dans Figma.
- Ton : humain, simple, chaleureux, moderne.
- Évite le jargon et les formulations corporate.
- Mode demandé : ${mode}
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
                    nodeId: {
                      type: "string"
                    },
                    original: {
                      type: "string"
                    },
                    recommended: {
                      type: "string"
                    },
                    variants: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      minItems: 3,
                      maxItems: 3
                    },
                    reason: {
                      type: "string"
                    }
                  },
                  required: [
                    "nodeId",
                    "original",
                    "recommended",
                    "variants",
                    "reason"
                  ],
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