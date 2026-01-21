export default async function handler(req, res) {
  // CORS headers
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
  const now = new Date();
  const currentTimeStr = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  try {
    if (provider === 'DeepSeek') {
      const apiKey = req.headers['x-deepseek-key'] || env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'DeepSeek API Key missing' });
      }

      const prompt = `
        当前日期: ${currentTimeStr}
        模拟 akshare 接口调用 + 龙虎榜数据分析：
        1. 板块涨幅榜 (Concept Board) - Top 3
        2. 财经快讯 (News) - Top 5
        3. 知名游资动向 (Smart Money) - 生成 2 位活跃游资/机构的今日操作。
           - 必须包含: 席位名称, 买入股票, 净买额(万), 操盘逻辑, 关键指标(如: 机构大买, 游资联动, 打板)。
        4. **市场情绪指数 (Market Sentiment)**:
           - score (0-100), cycleStage (e.g. 主升期/退潮期).
           - **warning**: 如果检测到情绪拐点（如高位滞涨、冰点反弹），必须给出预警信息（例如：高位强分歧，注意风险）。
           - **板块轮动建议**:
             - safeHavenSectors: 2个避险板块 (如银行, 高股息).
             - nextHotSectors: 2个潜伏/轮动方向 (如低空经济, AI应用).
        返回 JSON 结构: { "hotspots": [...], "news": [...], "tracking": [...], "investors": [...], "sentiment": { "score": 80, "safeHavenSectors": [], "nextHotSectors": [], ... } }
      `;

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
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API Error: ${response.status}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      
      // Data Hygiene
      if(parsed.hotspots) {
        parsed.hotspots.forEach(h => { 
          h.id = h.id || Math.random().toString(36).substr(2, 9); 
        });
      }
      
      return res.status(200).json(parsed);

    } else {
      // OpenAI Implementation
      const apiKey = req.headers['x-openai-key'] || env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'OpenAI API Key missing' });
      }

      const SYSTEM_INSTRUCTION_MARKET = `
你是一个专注A股的金融数据分析助手。目标：基于公开渠道（同花顺/东财/新浪财经/财新/一财）生成结构化的市场热点、新闻、游资、情绪数据。
要求：
- 不凭空捏造具体数值；若无确切数值，用0或“未知”
- 全部用简体中文
- 输出必须是JSON
`;

      const prompt = `
CURRENT DATETIME: ${currentTimeStr}
任务：生成一份「A股实时市场报告」。

步骤：
1) 热点板块Top3：搜索“A股 今日 热门板块 涨幅榜”
2) 龙头股：为每个板块生成1-2只龙头/容量股，给出估算价与涨跌幅
3) 财经快讯Top5：搜索“A股 财经快讯 利好消息”
4) 龙虎榜/游资：搜索“今日 龙虎榜 知名游资 净买入”，席位如呼家楼/陈小群/机构专用
5) 追踪：搜索“A股 昨日涨停板 复盘”给出跟踪标的
6) 市场情绪：搜索“A股 市场情绪指数 连板高度 炸板率 避险板块 轮动方向”
   - score(0-100)、cycleStage(启动/发酵/高潮/分歧/退潮/冰点)
   - warning 如有情绪拐点须提示
   - safeHavenSectors 2-3 个防御方向
   - nextHotSectors 2-3 个潜伏方向

输出JSON格式（严格）：
{
  "hotspots": [{ "id": "uuid", "title": "概念", "type": "类型", "description": "摘要", "rating": 5, "stocks": [{ "code": "000000", "name": "Name", "price": 0, "changePercent": 0, "score": 90, "reason": "逻辑" }] }],
  "news": [{ "id": "1", "time": "HH:MM", "title": "Title", "summary": "Sum", "tag": "Tag", "type": "positive" }],
  "investors": [{ "name": "Name", "seat": "Seat", "topBuys": [{ "stockName": "S", "stockCode": "000000", "netBuy": 1000, "reason": "R", "style": "S", "indicators": ["Tag"] }] }],
  "tracking": [],
  "sentiment": {
     "score": 60,
     "temperature": "Hot",
     "cycleStage": "主升期",
     "warning": "Optional warning message",
     "suggestion": "Detailed action advice",
     "trend": "Up",
     "safeHavenSectors": ["Sector A", "Sector B"],
     "nextHotSectors": ["Sector C", "Sector D"]
  }
}
`;

      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION_MARKET },
            { role: "user", content: prompt }
          ],
          temperature: 0.4,
          response_format: { type: 'json_object' }
        })
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API Error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const content = openaiData?.choices?.[0]?.message?.content || "{}";
      return res.status(200).json(JSON.parse(content));
    }
  } catch (error) {
    const isTimeout = error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || error?.code === 'UND_ERR_CONNECT_TIMEOUT';
    const details = {
      message: error?.message || 'Unknown error',
      code: error?.code,
      causeCode: error?.cause?.code,
      provider,
    };

    console.error("Market Report Error:", error);

    // External network failures are common in local dev (proxy/firewall). Return a clear, actionable error.
    if (isTimeout) {
      return res.status(502).json({
        error: 'Upstream request timeout',
        details,
        hint: '无法连接到上游模型服务（可能是网络/代理/防火墙导致）。请检查是否能访问 https://generativelanguage.googleapis.com 或 https://api.deepseek.com，并确认已配置代理（如有需要）。',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      details,
    });
  }
}
