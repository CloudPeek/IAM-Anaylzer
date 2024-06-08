import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { apiKey, policyDocument } = req.body;

    if (!apiKey || !policyDocument) {
      return res.status(400).json({ error: 'Missing apiKey or policyDocument' });
    }

    try {
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a AWS IAM expert." },
          { role: "user", content: `Please analyze the following IAM policy, giving insights on best practice, security, services, and resources it allows access to. Please summarize in 4 sentences and align to frameworks NIST 800-53 and ISO 20071.\n\n${policyDocument}` }
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 150,
      });

      return res.status(200).json({ analysis: completion.choices[0].message.content.trim() });
    } catch (error) {
      console.error('Error analyzing policy:', error);
      return res.status(500).json({ error: 'Analysis failed.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}

