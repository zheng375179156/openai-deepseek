export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-openai-key, x-deepseek-key');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    provider = 'OpenAI',
    code = '',
    name = '',
    sector = '',
    marketTheme = '',
    recentTrend = '',
  } = req.body || {};

  const env = req.env || process.env || {};

  // --- Prompts (locked style) ---
  const SYSTEM_PROMPT = `你是一名长期实战于A股市场的职业投资人，目标是在严格风控前提下，通过热点轮动、板块龙头、资金博弈与主升浪右侧交易实现高收益。

硬性风格约束：
1) 不抄底、不预测、不逆势；只做资金确认后的右侧买点
2) 重点：市场热点→板块轮动→龙头/容量中军→游资合力→散户接力
3) 技术只做“确认”：均线(5/10/20)、MACD(零轴/二次金叉/红柱)、KDJ(强势钝化/假死叉)、量能(放量突破/缩量回踩)
4) 必须给出明确结论：买入 / 持有 / 减仓 / 观望 / 清仓
5) 必须给出：建议仓位区间、止损/离场条件、1-2条风险监控信号

输出要求：
- 中文
- 结构化、偏实战、结论在前
- 禁止玄学/情绪化/模糊表达`;

  const buildUserPrompt = () => `请基于A股短中线“趋势主升 + 热点龙头 + 风控纪律”体系，对下列个股给出交易决策。

【输入信息】
- 股票代码：${code}
- 股票名称：${name}
- 所属板块：${sector}
- 当前市场主线：${marketTheme}
- 最近走势摘要（5~20日）：${recentTrend}

【分析框架】
一、市场环境与板块位置
- 市场阶段：启动 / 主升 / 分歧 / 退潮（给出理由）
- 板块是否属于当前前3热点？板块是否在走强/走弱？
- 个股地位：高度龙头 / 容量龙头 / 核心跟随 / 补涨（给出依据）

二、资金与游资视角（没有数据也要基于结构给出判断边界）
- 是否符合游资偏好：市值/流通盘/股性/换手
- 是否具备资金合力特征（如：炸板回封、分歧转一致、次日不低开等）

三、技术结构确认（只做确认，不做预测）
- 均线：5>10>20？是否沿5日线推升？
- MACD：零轴位置、二次金叉/红柱变化
- KDJ：60-90钝化/假死叉是否出现
- 量能：放量突破/缩量回踩是否成立

四、阶段判断与关键买点/卖点
- 当前属于：启动 / 主升 / 加速 / 高位震荡 / 退潮
- 是否存在：龙头第一次分歧 / 平台突破回踩 / 二次加速前（给出是否成立与条件）

五、操作建议（必须给结论）
- 结论：买入/持有/减仓/观望/清仓（只能选一个）
- 建议仓位：xx%~xx%
- 触发止损/离场条件：用“如果…则…”写清楚

六、风险预警
- 最大风险点（1条）
- 需要盯的信号（1~2条）`;

  try {
    if (provider === 'DeepSeek') {
      const apiKey = req.headers['x-deepseek-key'] || env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'DeepSeek API Key missing' });
      }

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt() },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || '';
      return res.status(200).json({ result: text });
    }

    // OpenAI default
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt() }
        ],
        temperature: 0.4
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return res.status(200).json({ result: text });
  } catch (e) {
    console.error('Analyze Stock Error:', e);
    return res.status(500).json({ error: e?.message || 'Internal Server Error' });
  }
}

