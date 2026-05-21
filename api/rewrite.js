import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { mode, texts } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Tu es Pixel Writer.

Senior UX Writer spécialisé mobile retail premium.

Tu travailles sur les apps Kiabi iOS & Android.

Tu dois :
- améliorer les textes UX
- écrire court
- maximiser la clarté
- challenger les CTA
- garder un ton humain
- respecter les contraintes mobile

Mode demandé : ${mode}
`
        },
        {
          role: "user",
          content: JSON.stringify(texts)
        }
      ]
    });

    res.status(200).json({
      result: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || "Erreur OpenAI"
    });
  }
}