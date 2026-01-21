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
  const stocksList = holdings.map(h => 
    `- Code: ${h.code}, Name: ${h.name}, Cost: ${h.costPrice}, PRICE: ${h.currentPrice}, CHANGE%: ${h.changePercent}%`
  ).join('\n');

  const prompt = `
    ROLE: A股顶级游资操盘手。
    TASK: 诊断持仓。
    1. 主力意图 (洗盘/出货/中继/主升).
    2. 一年长线预测 (projectedChange1Year).
    OUTPUT JSON ARRAY: [{ "code": "...", "aiAdvice": "...", "mainForceStatus": "...", "sentimentScore": 80, "predictedNextChange": "...", "projectedChange1Year": "...", "predictionLogic1Year": "..." }]
    DATA: ${stocksList}
  `;

  try {
    let resultJsonString = "[]";
    
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
          messages: [{ role: "user", content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API Error: ${response.status}`);
      }

      const r = await response.json();
      resultJsonString = r.choices[0].message.content;
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
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      resultJsonString = data.choices?.[0]?.message?.content || "[]";
    }
    
    // Clean and Parse
    const clean = resultJsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed = JSON.parse(clean);
    // Handle deepseek { stocks: [...] } wrapper sometimes
    if (!Array.isArray(parsed) && parsed.stocks) parsed = parsed.stocks;
    if (!Array.isArray(parsed)) parsed = [];
    
    return res.status(200).json(parsed);

  } catch (e) {
    console.error("Holdings Analyze Error:", e);
    return res.status(500).json([]);
  }
}
