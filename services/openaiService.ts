import { Hotspot, InvestorProfile, TrackingRecord, NewsItem, Holding, MarketSentiment } from "../types";

const callApi = async (endpoint: string, body: any) => {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let payloadText = "";
    try {
      payloadText = await res.text();
    } catch {}

    // Try parse structured error from server
    let message = "";
    try {
      const parsed = payloadText ? JSON.parse(payloadText) : null;
      message =
        parsed?.error ||
        parsed?.message ||
        parsed?.hint ||
        (parsed?.details ? JSON.stringify(parsed.details) : "");
    } catch {}

    if (!message) {
      message = payloadText || `${res.status} ${res.statusText}`.trim();
    }

    const finalMsg = `[${res.status}] ${message}`.trim();
    console.error("API Error:", finalMsg);
    throw new Error(finalMsg);
  }

  return res.json();
};

// 获取实时市场报告
export const fetchRealtimeMarketReport = async (): Promise<{
  hotspots: Hotspot[],
  news: NewsItem[],
  tracking: TrackingRecord[],
  investors: InvestorProfile[],
  sentiment?: MarketSentiment
}> => {
  try {
    const data = await callApi("/api/market/report", { provider: "OpenAI" });
    if (data.hotspots) {
      data.hotspots.forEach((h: any) => { 
        h.id = h.id || Math.random().toString(36).substr(2, 9); 
      });
    }
    return data;
  } catch (error) {
    console.error("OpenAI Fetch Error:", error);
    throw error;
  }
};

// 获取游资数据
export const fetchInvestorsOnly = async (): Promise<InvestorProfile[]> => {
  try {
    const data = await callApi("/api/market/investors", { provider: "OpenAI" });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

// 生成每日报告
export const generateDailyReport = async (
  hotspots: Hotspot[], 
  investors: InvestorProfile[], 
  tracking: TrackingRecord[]
): Promise<string> => {
  try {
    const context = JSON.stringify({ hotspots, investors, tracking });
    const data = await callApi("/api/report/daily", { 
      provider: "OpenAI", 
      data: context 
    });
    return data.text || "生成失败";
  } catch (e) { 
    return "API Error"; 
  }
};

// 询问分析师
export const askAIAnalyst = async (query: string, contextData: string): Promise<string> => {
  try {
    const data = await callApi("/api/analyst/chat", { 
      provider: "OpenAI", 
      query, 
      context: contextData 
    });
    return data.text || "Error";
  } catch(e) { 
    return "Error"; 
  }
};

// 分析持仓
export const analyzeHoldings = async (holdings: Holding[]): Promise<Holding[]> => {
  try {
    const aiResults = await callApi("/api/holdings/analyze", { 
      provider: "OpenAI", 
      holdings 
    });
    
    if (!Array.isArray(aiResults)) return holdings;
    
    return holdings.map(h => {
      const aiRes = aiResults.find((p: any) => p.code.includes(h.code) || h.code.includes(p.code));
      if (aiRes) {
        return { 
          ...h, 
          aiAdvice: aiRes.aiAdvice,
          aiAnalysis: aiRes.aiAnalysis,
          mainForceStatus: aiRes.mainForceStatus,
          mainForceReason: aiRes.mainForceReason,
          sentimentScore: aiRes.sentimentScore,
          marketMood: aiRes.marketMood,
          pressurePrice: aiRes.pressurePrice,
          supportPrice: aiRes.supportPrice,
          detailedStrategy: aiRes.detailedStrategy,
          predictedNextChange: aiRes.predictedNextChange,
          projectedChange1Year: aiRes.projectedChange1Year,
          predictionLogic1Year: aiRes.predictionLogic1Year
        }; 
      }
      return h;
    });
  } catch (e) { 
    return holdings; 
  }
};

// 生成持仓报告
export const generateHoldingsReport = async (holdings: Holding[]): Promise<string> => {
  const analyzed = holdings.filter(h => h.aiAdvice);
  if (analyzed.length === 0) return "暂无持仓分析数据，请先点击\"游资诊断\"按钮获取分析结果。";

  try {
    const data = await callApi("/api/holdings/report", { 
      provider: "OpenAI", 
      holdings 
    });
    return data.text || "生成失败";
  } catch (e) { 
    return "生成错误"; 
  }
};

// 股票搜索
export const searchStock = async (code: string): Promise<{ name: string, price: number } | null> => {
  try {
    const data = await callApi("/api/stock/search", {
      provider: "OpenAI",
      code
    });

    const price =
      typeof data.price === "number"
        ? data.price
        : parseFloat(data.price);

    if (data.name && !isNaN(price)) {
      return { name: data.name, price };
    }

    return null;
  } catch (e) {
    console.error("searchStock failed", e);
    return null;
  }
};
