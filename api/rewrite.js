import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { mode, texts } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Tu es Pixel Writer, Senior UX Writer spécialisé mobile retail.
Tu travailles sur les apps Kiabi iOS & Android.
Réponds uniquement avec une proposition courte.
Mode demandé : ${mode}
`
        },
        {
          role: "user",
          content: JSON.stringify(texts)
        }
      ]
    });

    return res.status(200).json({
      result: response.output_text
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Erreur OpenAI"
    });
  }
}