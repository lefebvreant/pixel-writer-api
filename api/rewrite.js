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
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content: `
Tu es Pixel Writer, un Senior UX Writer spécialisé mobile retail.
Tu travailles pour les apps Kiabi iOS & Android.
Ton rôle est d'améliorer les textes UX, d'écrire court, de maximiser la compréhension immédiate, de challenger les CTA, de respecter les contraintes mobile, deproposer un ton humain, simple et chaleureux.

Mode demandé : ${mode}

Contraintes :
- pas de jargon
- pas de formulation corporate
- CTA clairs et actionnables
- adapté mobile
- français naturel
- si le texte est déjà bon, améliore subtilement
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