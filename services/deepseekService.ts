
import { Hotspot, NewsItem, TrackingRecord, Holding, InvestorProfile, MarketSentiment } from "../types";

const callApi = async (endpoint: string, body: any) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    let payloadText = "";
    try {
      payloadText = await response.text();
    } catch {}

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
      message = payloadText || `${response.status} ${response.statusText}`.trim();
    }

    throw new Error(`[${response.status}] ${message}`.trim());
  }
  
  return await response.json();
};

export const fetchDeepSeekMarketReport = async (): Promise<{
    hotspots: Hotspot[],
    news: NewsItem[],
    tracking: TrackingRecord[],
    investors: InvestorProfile[],
    sentiment?: MarketSentiment
}> => {
    try {
        const data = await callApi('/api/market/report', { provider: 'DeepSeek' });
        if(data.hotspots) {
            data.hotspots.forEach((h: any) => { 
                h.id = h.id || Math.random().toString(36).substr(2, 9); 
            });
        }
        return data;
    } catch (error) {
        console.error("DeepSeek Fetch Error:", error);
        throw error;
    }
};

export const fetchDeepSeekInvestorsOnly = async (): Promise<InvestorProfile[]> => {
    try {
        const data = await callApi('/api/market/investors', { provider: 'DeepSeek' });
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
};

export const askDeepSeekAnalyst = async (query: string, contextData: string): Promise<string> => {
     try {
        const data = await callApi('/api/analyst/chat', { 
            provider: 'DeepSeek', 
            query, 
            context: contextData 
        });
        return data.text || "Error";
    } catch(e) { return "Error"; }
};

export const generateDeepSeekDailyReport = async (context: string): Promise<string> => {
    try {
        const data = await callApi('/api/report/daily', { 
            provider: 'DeepSeek', 
            data: context 
        });
        return data.text || "生成失败";
    } catch (e) { return "API Error"; }
};

export const analyzeDeepSeekHoldings = async (holdings: Holding[]): Promise<Holding[]> => {
    try {
        const aiResults = await callApi('/api/holdings/analyze', { 
            provider: 'DeepSeek', 
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
    } catch (e) { return holdings; }
};

export const generateDeepSeekHoldingsReport = async (holdings: Holding[]): Promise<string> => {
  const analyzed = holdings.filter(h => h.aiAdvice);
  if (analyzed.length === 0) return "暂无持仓分析数据，请先点击\"游资诊断\"按钮获取分析结果。";

  try {
    const data = await callApi('/api/holdings/report', { 
        provider: 'DeepSeek', 
        holdings 
    });
    return data.text || "生成失败";
  } catch (e) { return "生成错误"; }
};

export const searchDeepSeekStock = async (code: string): Promise<{ name: string, price: number } | null> => {
     try {
        const data = await callApi('/api/stock/search', { 
            provider: 'DeepSeek', 
            code 
        });
        return { name: data.name || "未知", price: data.price || 0 };
     } catch (e) { return null; }
};
