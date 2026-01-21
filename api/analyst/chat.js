export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-openai-key, x-deepseek-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, query, context } = req.body;
  const env = req.env || process.env || {};
  
  try {
    if (provider === 'DeepSeek') {
      const apiKey = req.headers['x-deepseek-key'] || env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'DeepSeek API Key missing' });
      }

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "你是一位投资顾问。" },
            { role: "user", content: `Context: ${context}\nQuestion: ${query}` }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API Error: ${response.status}`);
      }

      const r = await response.json();
      return res.status(200).json({ text: r.choices[0].message.content });
    } else {
      const apiKey = req.headers['x-openai-key'] || env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'OpenAI API Key missing' });
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: [
            { role: "system", content: "你是一位投资顾问，请基于中国A股市场给出简洁、具体的回答。" },
            { role: "user", content: `Context: ${context}\nQuestion: ${query}` }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      return res.status(200).json({ text: data.choices?.[0]?.message?.content || '' });
    }
  } catch (e) {
    console.error("Chat Error:", e);
    return res.status(500).json({ text: "Error" });
  }
}
