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

  const { provider } = req.body;
  const env = req.env || process.env || {};
  
  try {
    const prompt = `TASK: Search/Generate latest Dragon Tiger List (龙虎榜) data for China A-Shares TODAY. Return JSON { "investors": [...] }`;
     
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
            { 
              role: "system", 
              content: "你是一个专业的 A 股数据接口模拟器。你的任务是模拟 akshare 的数据返回格式。用户要求：严禁凭空捏造数据，但由于你是模拟器，请基于当前市场逻辑生成高度仿真的数据。" 
            }, 
            { role: "user", content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API Error: ${response.status}`);
      }

      const data = await response.json();
      return res.status(200).json(JSON.parse(data.choices[0].message.content).investors || []);
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
            { role: "system", content: "你是A股龙虎榜/游资数据助手，不要编造数值，输出JSON。" },
            { role: "user", content: `
CURRENT DATETIME: ${new Date().toISOString()}
任务：生成「顶级游资 / 龙虎榜」榜单Top5。
搜索提示：今日 龙虎榜 知名游资 净买入（席位如呼家楼、陈小群、机构专用）。
输出JSON：{ "investors": [ { "name": "席位", "seat": "席位全称", "topBuys": [{ "stockName": "S", "stockCode": "000000", "netBuy": 1000, "reason": "R", "style": "S", "indicators": ["标签"] }], "topSells": [], "history": [] } ] }
` }
          ],
          temperature: 0.4,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || "{}";
      return res.status(200).json(JSON.parse(content).investors || []);
    }
  } catch (error) {
    console.error("Investors Error:", error);
    return res.status(200).json([]);
  }
}
