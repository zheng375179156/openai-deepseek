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

  const { provider, code } = req.body;

  const prompt = `
Find the stock name and latest price for China A-share stock ${code}.
Return ONLY valid JSON like:
{"name":"xxx","price":123.45}
`;

  try {
    let apiUrl;
    let apiKey;
    let body;

    if (provider === "DeepSeek") {
      apiUrl = "https://api.deepseek.com/chat/completions";
      apiKey = process.env.DEEPSEEK_API_KEY;

      body = {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0
      };
    } else {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      apiKey = process.env.OPENAI_API_KEY;

      body = {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0
      };
    }

    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    const rawText = await response.text();

    if (!response.ok) {
      console.error("LLM raw response:", rawText);
      return res.status(500).json({ error: "LLM request failed" });
    }

    const data = JSON.parse(rawText);
    const result = JSON.parse(data.choices[0].message.content);

    return res.status(200).json(result);

  } catch (e) {
    console.error("Stock Search Error:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
