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

  const { provider, holdings } = req.body;
  const env = req.env || process.env || {};
  const dataStr = JSON.stringify(holdings.map(h => ({ 
    name: h.name, code: h.code, advice: h.aiAdvice, mainForce: h.mainForceStatus 
  })));
  const prompt = `ROLE: A股操盘手. 生成《主力持仓深度复盘与长线展望报告》。Markdown格式。DATA: ${dataStr}`;

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
          messages: [{ role: "user", content: prompt }]
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
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      return res.status(200).json({ text: data.choices?.[0]?.message?.content || '' });
    }
  } catch (e) {
    console.error("Holdings Report Error:", e);
    return res.status(500).json({ text: "Report Error" });
  }
}
