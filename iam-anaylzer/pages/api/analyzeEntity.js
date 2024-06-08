import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { apiKey, forOverviewAnalysisBase64 } = req.body;

    if (!apiKey || !forOverviewAnalysisBase64) {
      return res.status(400).json({ error: 'Missing apiKey or forOverviewAnalysisBase64' });
    }

    try {
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a AWS IAM expert." },
          { role: "user", content: `Using the following data please give a description of what the ARN, its capabilities, if it meets IAM best practice and if it's a security concern. Please lay this out in the following JSON format: {ARN_capabilities: description, Best_Practice: bool, BestPractice_description: description, Security_Concerns: bool, SecurityDescription: description, Recommendations: description}  ${forOverviewAnalysisBase64}` }
        ],
        model: "gpt-4o",
        max_tokens: 2000,
        response_format: { type: "json_object" },
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




// Function to remove circular references
function removeCircularReferences(obj) {
  const seen = new WeakSet();
  function clean(obj) {
    if (obj && typeof obj === 'object') {
      if (seen.has(obj)) {
        return;
      }
      seen.add(obj);
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          obj[key] = clean(obj[key]);
        }
      }
    }
    return obj;
  }
  return clean(obj);
}
