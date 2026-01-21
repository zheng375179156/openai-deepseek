
export enum Sentiment {
  Bullish = 'Bullish',
  Neutral = 'Neutral',
  Bearish = 'Bearish'
}

export type AIProvider = 'OpenAI' | 'DeepSeek';

export enum HotspotType {
  Policy = '政策利好',
  Tech = '技术突破',
  Merger = '并购重组',
  Industry = '行业景气',
  Event = '突发事件'
}

export interface Stock {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number; // In Billions
  pe?: number;
  sector: string;
  score: number;
  reason?: string;
  tags?: string[];
  recommendation?: 'Buy' | 'Hold' | 'Sell' | 'Watch';
}

export interface Hotspot {
  id: string;
  title: string;
  type: HotspotType;
  description: string;
  rating: number; // 1-5 stars
  stocks: Stock[];
  date: string;
}

export interface NewsItem {
  id: string;
  time: string; // "01-11 14:30"
  title: string;
  summary: string;
  tag: string; // "重磅", "突发", "利好"
  type: 'positive' | 'neutral' | 'negative';
  url?: string; // Link to the news source
}

export interface InvestorAction {
  stockCode: string;
  stockName: string;
  netBuy: number; // In 10k (wan)
  reason: string;
  style: string;
  // New fields for Smart Money Analysis
  price?: number;
  changePercent?: number;
  indicators?: string[]; // e.g., ["游资联动", "机构加仓", "低吸", "打板"]
}

export interface InvestorProfile {
  name: string;
  seat: string; // 常用席位
  topBuys: InvestorAction[];
  topSells: InvestorAction[];
  history: { stockName: string; amount: number; profit: number }[];
}

export interface TrackingRecord {
  stock: Stock;
  yesterdayScore: number;
  todayScore: number;
  action: '持有' | '减仓' | '卖出'; // Changed to Chinese as requested
  comment: string;
}

export interface Holding {
  code: string;
  name: string;
  costPrice: number;
  quantity: number;
  currentPrice?: number;
  changePercent?: number;
  totalValue?: number;
  profit?: number;
  profitPercent?: number;
  
  // AI Analysis Fields
  aiAdvice?: '强力持有' | '持有' | '减仓' | '清仓' | '观望' | '做T';
  aiAnalysis?: string; // Original brief analysis or title
  
  // Advanced Youzi Fields
  sentimentScore?: number; // 0-100, 情绪评分
  pressurePrice?: string; // 压力位
  supportPrice?: string; // 支撑位
  detailedStrategy?: string; // 详细操盘策略
  marketMood?: string; // e.g., "分歧", "一致", "退潮", "高潮"
  predictedNextChange?: string; // e.g. "+2% ~ +4%" (Short term)
  
  // Dump vs Wash Analysis
  mainForceStatus?: '主力洗盘' | '主力出货' | '中继蓄势' | '主升浪' | '吸筹';
  mainForceReason?: string; // Explanation for the status judgment

  // Long Term Prediction
  projectedChange1Year?: string; // e.g. "+30%" or "-10%"
  predictionLogic1Year?: string; // Logic for the 1 year forecast
}

export interface MarketSentiment {
    score: number; // 0-100 (0=Freezing, 100=Overheated)
    temperature: 'Ice' | 'Cold' | 'Warm' | 'Hot' | 'Extreme';
    cycleStage: string; // e.g. "启动期", "发酵期", "高潮期", "分歧期", "退潮期"
    warning?: string; // Specific inflection point warning (e.g. "高位强分歧预警")
    suggestion: string; // Actionable suggestion
    trend: 'Up' | 'Down' | 'Stable';
    safeHavenSectors?: string[]; // New: 防御避险板块 (e.g. 银行, 高股息)
    nextHotSectors?: string[];   // New: 下一个热点/潜伏方向 (e.g. 低空经济)
}
