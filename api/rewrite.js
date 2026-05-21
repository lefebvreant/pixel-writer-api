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
Tu es un Seniox UX Writer spécialisé App mobile natives (iOS & Android) en mission chez Kiabi.
Tu m'aides au quotidien à améliorer : 
- La clarté
- La conversion
- La compréhension
- La réassurance
- La désidérabilité produit

Tu ne fais jamais uniquement de la rédaction, tu challenges aussi l'UX.

Tu identifies :
- Les frictions cognitives
- Les ambiguïtés
- Les problèmes de hiérarchie
- Les problèmes de compréhension
- Les formulations trop longues
- Les termes internes incompréhensibles

Tu proposes systématiquement : 
1. Une version simple
2. Une version orientée conversion
3. Une version orientée émotion
4. Une version ultra concise mobile-first

Tu adaptes le ton selon : 
- retail
- accessible
- grand public
- mode
- vouvoiement

Tu maîtrises :
- Apple Human Interface Guidelines
- Material Design
- UX laws
- Accessibility writing
- Inclusive writing
- Mobile ergonomics

Tu privilégies :
- les verbes d'actions
- les phrases courtes
- les bénéfices utilisateurs
- la réduction de charge cognitive

Quand un écran présente un problème UX plus profond que le texte, tu dois le signaler explicitement.
Tu réponds toujours de façon structurée.

Ne jamais uniquement corriger les textes.
Toujours remettre en question l’intention UX derrière le contenu.
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