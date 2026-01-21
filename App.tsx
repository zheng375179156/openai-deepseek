
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Users, FileText, Zap, Search, Menu, X, Clock, RefreshCw, Calendar, Loader2, Globe, Filter, Database, AlertTriangle, ExternalLink, Info, Settings, PieChart, Tag, Save, Key, Server, ShieldCheck } from 'lucide-react';
import { Hotspot, InvestorProfile, TrackingRecord, NewsItem, AIProvider, Holding, Stock, MarketSentiment } from './types';
import HotspotCard from './components/HotspotCard.tsx';
import NewsModule from './components/NewsModule.tsx';
import HoldingsModule from './components/HoldingsModule.tsx';
import SentimentGauge from './components/SentimentGauge.tsx';
import { fetchMarketData, generateReportDispatcher, askAnalystDispatcher, refreshInvestorsDispatcher } from './services/marketService';
import ReactMarkdown from 'react-markdown';
import StockAnalyze from './components/StockAnalyze.tsx';

// --- APP COMPONENT ---

type BoardType = 'ALL' | 'MAIN' | 'CHINEXT' | 'STAR';

// --- Inline SettingsModal to avoid build-time missing-file resolution in some builders ---
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProvider: AIProvider;
  onSave: (provider: AIProvider, deepseekKey: string, openaiKey: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentProvider, onSave }) => {
  const [provider, setProvider] = useState<AIProvider>(currentProvider);
  const [deepseekKey, setDeepseekKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProvider(currentProvider);
      setDeepseekKey(localStorage.getItem('deepseek_api_key') || '');
      setOpenaiKey(localStorage.getItem('openai_api_key') || '');
    }
  }, [isOpen, currentProvider]);

  const handleSave = () => {
    onSave(provider, deepseekKey, openaiKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Server className="w-5 h-5 text-accent" />
            数据引擎配置
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              选择 AI 引擎
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProvider('OpenAI')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  provider === 'OpenAI'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700'
                }`}
              >
                <Globe className={`w-6 h-6 mb-2 ${provider === 'OpenAI' ? 'text-blue-400' : 'text-gray-500'}`} />
                <span className="font-bold text-sm">OpenAI</span>
                <span className="text-[10px] opacity-60 mt-1">需科学上网 / 综合能力强</span>
              </button>

              <button
                onClick={() => setProvider('DeepSeek')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  provider === 'DeepSeek'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                    : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700'
                }`}
              >
                <Database className={`w-6 h-6 mb-2 ${provider === 'DeepSeek' ? 'text-indigo-400' : 'text-gray-500'}`} />
                <span className="font-bold text-sm">DeepSeek</span>
                <span className="text-[10px] opacity-60 mt-1">国内直连 / 模拟数据源</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {provider === 'DeepSeek' && (
              <div className="animate-fade-in">
                <label className="block text-xs text-gray-400 mb-1">DeepSeek API Key (Domestic)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  模拟集成 Akshare/RQdata 数据逻辑。
                  <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline ml-1">
                    获取 Key
                  </a>
                </p>
              </div>
            )}

            {provider === 'OpenAI' && (
              <div className="animate-fade-in">
                <label className="block text-xs text-gray-400 mb-1">OpenAI API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="输入 OpenAI Key"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            保存并应用
          </button>
        </div>
      </div>
    </div>
  );
};

const CACHE_KEY = 'smart_invest_storage_v3'; // Bumped version for new schema
const SETTINGS_KEY = 'smart_invest_settings';
const HOLDINGS_KEY = 'smart_invest_holdings';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'holdings' | 'tracking' | 'smartmoney' | 'report' | 'analysis'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<BoardType>('ALL');
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('OpenAI');

  // Data State
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [tracking, setTracking] = useState<TrackingRecord[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]); 
  const [sentiment, setSentiment] = useState<MarketSentiment | undefined>(undefined);
  
  const [dataDate, setDataDate] = useState<string>(''); 
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(''); 
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingInvestors, setIsLoadingInvestors] = useState(false); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real Time State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Report & Chat State
  const [reportContent, setReportContent] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  // Initialize Data
  useEffect(() => {
    setCurrentTime(new Date());

    // Load Settings
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.provider) setProvider(parsed.provider);
    }
    
    // Load Holdings - Persistence Check: ONLY load, do not reset.
    const storedHoldings = localStorage.getItem(HOLDINGS_KEY);
    if (storedHoldings) {
        try {
            setHoldings(JSON.parse(storedHoldings));
        } catch (e) {
            console.error("Failed to parse holdings", e);
        }
    }

    const initData = async () => {
      let hasCache = false;
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          if (data && data.hotspots && data.hotspots.length > 0) {
            setHotspots(data.hotspots || []);
            setNews(data.news || []);
            setInvestors(data.investors || []);
            setTracking(data.tracking || []);
            setSentiment(data.sentiment);
            setDataDate(data.date || '');
            setLastUpdatedTime(data.timestamp || '未知时间');
            setReportContent(data.reportContent || '');
            hasCache = true;
          }
        }
      } catch (e) {
        console.error("Failed to load cached data", e);
      }
      // Note: We strictly DO NOT auto-refresh here to preserve state unless user clicks refresh.
    };

    initData();

    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockTimer);
  }, []);

  // Persist holdings whenever they change
  useEffect(() => {
    if (holdings.length > 0) {
        localStorage.setItem(HOLDINGS_KEY, JSON.stringify(holdings));
    }
  }, [holdings]);

  const handleSettingsSave = (newProvider: AIProvider, deepseekKey: string, openaiKey: string) => {
      setProvider(newProvider);
      if (deepseekKey) localStorage.setItem('deepseek_api_key', deepseekKey);
      if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ provider: newProvider }));
  };

  const handleManualRefresh = async (overrideProvider?: AIProvider) => {
    setIsLoadingData(true);
    setErrorMsg(null);
    
    const activeProvider = overrideProvider || provider;
    const tradingDay = new Date(); 
    
    try {
        const data = await fetchMarketData(tradingDay, activeProvider);
        
        if (!data.hotspots.length && !data.news.length && !data.date) {
             throw new Error("未能获取有效数据，请检查网络或API配置");
        }

        const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
        
        // --- 95+ High Score Auto-Archiving Logic ---
        const highScoringStocks: Stock[] = (data.hotspots || [])
            .flatMap(h => h.stocks || [])
            .filter(s => s && typeof s.score === 'number' && s.score >= 95);
        
        const updatedTracking = [...(data.tracking || [])];

        highScoringStocks.forEach(stock => {
            if (!stock) return;
            const alreadyTracked = updatedTracking.some(t => t.stock && t.stock.code === stock.code);
            if (!alreadyTracked) {
                updatedTracking.push({
                    stock: stock,
                    yesterdayScore: stock.score, 
                    todayScore: stock.score,
                    action: '持有',
                    comment: '【系统自动归档】热点评分 95+ 强势股，建议重点关注。'
                });
            }
        });

        setHotspots(data.hotspots);
        setNews(data.news || []);
        setInvestors(data.investors);
        setTracking(updatedTracking); 
        setSentiment(data.sentiment);
        setDataDate(data.date);
        setLastUpdatedTime(nowStr);
        
        const cacheData = {
          hotspots: data.hotspots,
          news: data.news,
          investors: data.investors,
          tracking: updatedTracking, 
          sentiment: data.sentiment,
          date: data.date,
          timestamp: nowStr,
          reportContent: reportContent
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    } catch (error: any) {
        console.error("Failed to load market data", error);
        setErrorMsg(error.message || "刷新失败");
    } finally {
        setIsLoadingData(false);
    }
  };

  const handleSmartMoneyRefresh = async () => {
      setIsLoadingInvestors(true);
      try {
          const freshInvestors = await refreshInvestorsDispatcher(provider, hotspots);
          setInvestors(freshInvestors);
          
          // Update Cache
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const data = JSON.parse(cached);
            data.investors = freshInvestors;
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          }
      } catch (e) {
          console.error("Smart Money Refresh Failed", e);
      } finally {
          setIsLoadingInvestors(false);
      }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const report = await generateReportDispatcher(provider, hotspots, investors, tracking);
    setReportContent(report);
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        data.reportContent = report;
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to update cache with report", e);
    }
    
    setIsGeneratingReport(false);
  };

  const handleChat = async () => {
    if (!chatQuery.trim()) return;
    setIsChatting(true);
    const context = JSON.stringify({ hotspots: hotspots, tracking: tracking, news: news, holdings: holdings.map(h => `${h.name}(${h.code})`) });
    const res = await askAnalystDispatcher(provider, chatQuery, context);
    setChatResponse(res);
    setIsChatting(false);
  };

  // --- ADD STOCK LOGIC ---
  const handleAddStockFromHotspot = (stock: Stock) => {
    const exists = holdings.some(h => h.code === stock.code);
    if (exists) {
        alert(`【${stock.name}】已在持仓列表中，请勿重复添加。`);
        return;
    }
    const newHolding: Holding = {
        code: stock.code,
        name: stock.name,
        costPrice: stock.price, 
        quantity: 100, 
        currentPrice: stock.price,
        changePercent: stock.changePercent,
        aiAdvice: '观望', 
        aiAnalysis: stock.reason || '来自热点推荐', 
        sentimentScore: stock.score 
    };
    const updated = [...holdings, newHolding];
    setHoldings(updated);
    if (window.confirm(`已添加【${stock.name}】到持仓管理。\n是否立即前往持仓页面查看？`)) {
        setActiveTab('holdings');
    }
  };

  // --- FILTER LOGIC ---
  const checkStockBoard = (code: string | undefined, board: BoardType): boolean => {
    if (!code) return false;
    if (board === 'ALL') return true;
    if (board === 'MAIN') return code.startsWith('60') || code.startsWith('00');
    if (board === 'CHINEXT') return code.startsWith('30');
    if (board === 'STAR') return code.startsWith('68');
    return false;
  };

  const filteredHotspots = (hotspots || []).map(h => ({
    ...h,
    stocks: (h.stocks || []).filter(s => s && checkStockBoard(s.code, selectedBoard))
  })).filter(h => h.stocks && h.stocks.length > 0);

  const filteredTracking = (tracking || []).filter(t => t && t.stock && checkStockBoard(t.stock.code, selectedBoard));

  const getTonghuashunLink = (code: string | undefined) => {
    if (!code) return '#';
    const pureCode = code.replace(/\D/g, '');
    return `http://stockpage.10jqka.com.cn/${pureCode}/`;
  };

  const isDemoMode = dataDate && dataDate.includes('演示');

  const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === id 
          ? 'bg-accent text-white font-medium shadow-lg shadow-blue-500/20' 
          : 'text-gray-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  const FilterButton = ({ type, label }: { type: BoardType, label: string }) => (
    <button
      onClick={() => setSelectedBoard(type)}
      className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all font-medium ${
        selectedBoard === type 
          ? 'bg-accent text-white shadow-md' 
          : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-darkBg text-gray-200 font-sans selection:bg-accent selection:text-white">
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentProvider={provider}
        onSave={handleSettingsSave}
      />

      {/* HEADER */}
      <header className="fixed top-0 w-full z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${provider === 'DeepSeek' ? 'bg-indigo-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'}`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">智投热点助手</h1>
                <span className="text-[10px] text-gray-400 -mt-1 hidden sm:block">
                    Powered by {provider === 'DeepSeek' ? 'DeepSeek V3' : 'OpenAI GPT'}
                </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:hidden">智投</h1>
          </div>
          
          <div className="flex-1 flex justify-center md:justify-end md:mr-4">
             <div className="flex items-center gap-4 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50">
                <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm border-r border-gray-600 pr-4">
                   <Calendar className="w-3.5 h-3.5" />
                   <span>{currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-mono font-bold w-[70px]">
                   <Clock className="w-3.5 h-3.5" />
                   <span>{currentTime.toLocaleTimeString('zh-CN', { hour12: false })}</span>
                </div>
             </div>
          </div>
          
          <nav className="hidden md:flex gap-2 mr-2">
            <NavItem id="dashboard" label="热点推荐" icon={LayoutDashboard} />
            <NavItem id="holdings" label="持仓管理" icon={PieChart} />
            <NavItem id="tracking" label="昨日追踪" icon={TrendingUp} />
            <NavItem id="smartmoney" label="游资动向" icon={Users} />
            <NavItem id="report" label="AI研报" icon={FileText} />
            <NavItem id="analysis" label="个股分析" icon={ShieldCheck} />
          </nav>

          <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="引擎设置"
            >
                <Settings className="w-5 h-5" />
            </button>
            <button 
                className="md:hidden text-gray-300 p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900 pt-20 px-4 md:hidden animate-fade-in">
           <div className="flex flex-col gap-4">
            <NavItem id="dashboard" label="热点推荐" icon={LayoutDashboard} />
            <NavItem id="holdings" label="持仓管理" icon={PieChart} />
            <NavItem id="tracking" label="昨日追踪" icon={TrendingUp} />
            <NavItem id="smartmoney" label="游资动向" icon={Users} />
            <NavItem id="report" label="AI研报" icon={FileText} />
              <NavItem id="analysis" label="个股分析" icon={ShieldCheck} />
           </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        
        {/* DEMO MODE BANNER */}
        {isDemoMode && !isLoadingData && (
             <div className="mb-6 bg-blue-900/30 border border-blue-500/50 text-blue-200 p-3 rounded-lg flex items-center gap-3 animate-fade-in">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-bold">演示模式：</span> 
                      请点击右上角设置图标 <Settings className="w-3 h-3 inline" /> 配置 API Key 以获取实时数据。
                    </p>
                </div>
            </div>
        )}

        {/* ERROR BANNER */}
        {errorMsg && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-start gap-3 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-sm mb-1">数据获取中断</h3>
                    <p className="text-xs opacity-90">{errorMsg}</p>
                    {errorMsg.includes('Key') && (
                        <button 
                            onClick={() => setIsSettingsOpen(true)} 
                            className="text-xs underline mt-2 hover:text-white"
                        >
                            去配置 API Key
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* BOARD FILTER BAR */}
        {activeTab !== 'holdings' && activeTab !== 'report' && activeTab !== 'analysis' && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mr-1">
                <Filter className="w-4 h-4" />
                <span>板块筛选:</span>
              </div>
              <FilterButton type="ALL" label="全部股票" />
              <FilterButton type="MAIN" label="沪深主板" />
              <FilterButton type="CHINEXT" label="创业板" />
              <FilterButton type="STAR" label="科创板" />
            </div>
        )}

        {/* DATA SOURCE BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 gap-3">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                    <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${isLoadingData ? 'bg-blue-500' : (provider === 'DeepSeek' ? 'bg-indigo-500' : 'bg-green-500')}`}></div>
                        {isLoadingData && <div className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping opacity-75"></div>}
                    </div>
                    <span className="text-sm text-gray-400 font-medium flex items-center gap-2">
                        {isLoadingData 
                            ? `AI (${provider}) 正在分析...` 
                            : provider === 'DeepSeek' 
                                ? '模拟 Akshare / RQdata 源 (DeepSeek)' 
                        : 'OpenAI 搜索/推理源'
                        }
                    </span>
                </div>
                <span className="text-xs text-gray-500">
                   {provider === 'DeepSeek' 
                        ? '国内直连模式 · 模拟 Python 后端数据结构' 
                        : '国际模式 · 实时搜索全网财经媒体'
                   }
                </span>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              {lastUpdatedTime && !errorMsg && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-slate-800 px-3 py-2 rounded border border-slate-700">
                  <Database className="w-3 h-3" />
                  <span>上次更新: {lastUpdatedTime}</span>
                </div>
              )}
              
              <button 
                  onClick={() => handleManualRefresh()}
                  disabled={isLoadingData}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-md text-xs sm:text-sm flex items-center justify-center gap-2 text-white transition-all disabled:opacity-50 border border-slate-600 shadow-sm"
              >
                  {isLoadingData ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>立即刷新</span>
              </button>
            </div>
        </div>

        {/* LOADING STATE (Initial) */}
        {isLoadingData && hotspots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">
                    {provider === 'DeepSeek' ? 'DeepSeek 正在模拟 Akshare 数据获取...' : 'OpenAI 正在检索/推演实时数据...'}
                </p>
                <p className="text-xs text-gray-600 mt-2">智能分析约需 5-10 秒</p>
            </div>
        )}

        {/* EMPTY STATE (No Cache & No Load) */}
        {!isLoadingData && hotspots.length === 0 && !errorMsg && activeTab === 'dashboard' && (
          <div className="flex flex-col items-center justify-center py-24 bg-cardBg rounded-xl border border-slate-700 border-dashed">
            <div className="bg-slate-800 p-4 rounded-full mb-4">
              <RefreshCw className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">暂无实时数据</h3>
            <p className="text-gray-400 text-sm max-w-md text-center mb-6">
              请点击“立即刷新”按钮，AI将检索最新的A股热点与行情数据。
            </p>
            <button 
                onClick={() => handleManualRefresh()}
                className="px-6 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
                开始获取数据
            </button>
          </div>
        )}
        
        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && hotspots.length > 0 && (
          <div className={`space-y-6 animate-fade-in ${isLoadingData ? 'opacity-50 pointer-events-none' : ''}`}>
             
             {/* TOP SECTION: Hotspots + News */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT: HOTSPOT CARDS (2/3 Width) */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="flex justify-between items-end mb-2">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">今日热点风口</h2>
                        <p className="text-gray-400 text-sm">
                            {provider === 'DeepSeek' ? '基于 Akshare 概念板指模拟' : '基于多渠道聚合 (同花顺/东财/新浪/财新/第一财经)'}
                        </p>
                      </div>
                   </div>
                   
                   {/* Sentiment Gauge (New) */}
                   {sentiment && <SentimentGauge sentiment={sentiment} />}

                   {/* EMPTY STATES */}
                   {filteredHotspots.length === 0 && (
                     <div className="text-gray-500 text-center py-10 bg-cardBg rounded-xl border border-slate-700">
                        当前板块下暂无相关热点股票推荐。
                     </div>
                   )}

                   {filteredHotspots.map(hotspot => (
                     <HotspotCard 
                        key={hotspot.id} 
                        hotspot={hotspot} 
                        onAddToHoldings={handleAddStockFromHotspot} 
                     />
                   ))}
                </div>

                {/* RIGHT: NEWS MODULE (1/3 Width) */}
                <div className="lg:col-span-1 h-full">
                   <NewsModule news={news} />
                </div>
             </div>

          </div>
        )}

        {/* HOLDINGS VIEW (New) */}
        {activeTab === 'holdings' && (
            <HoldingsModule 
                holdings={holdings} 
                setHoldings={setHoldings} 
                provider={provider} 
            />
        )}

        {/* TRACKING VIEW */}
        {activeTab === 'tracking' && hotspots.length > 0 && (
          <div className={`animate-fade-in ${isLoadingData ? 'opacity-50 pointer-events-none' : ''}`}>
             <h2 className="text-2xl font-bold text-white mb-6">昨日推荐追踪</h2>
             
             {tracking.length === 0 && (
                 <div className="text-gray-500 text-center py-10 bg-cardBg rounded-xl border border-slate-700">
                    暂无昨日追踪数据。
                 </div>
             )}
             {tracking.length > 0 && filteredTracking.length === 0 && (
                 <div className="text-gray-500 text-center py-10 bg-cardBg rounded-xl border border-slate-700">
                    当前板块下暂无追踪记录。
                 </div>
             )}

             <div className="grid gap-4">
                {filteredTracking.map((track, idx) => (
                  <div key={idx} className="bg-cardBg border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-md">
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-center mb-2">
                        <a 
                           href={getTonghuashunLink(track.stock.code)}
                           target="_blank" 
                           rel="noreferrer"
                           className="group flex items-center"
                        >
                            <span className="font-bold text-lg text-white mr-2 group-hover:text-accent transition-colors flex items-center gap-1">
                                {track.stock.name}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                            <span className="text-xs text-gray-500 group-hover:text-accent/80 transition-colors underline decoration-dotted underline-offset-2">
                                {track.stock.code.replace(/\D/g, '')}
                            </span>
                        </a>
                        <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                          track.action === '持有' ? 'bg-blue-500/20 text-blue-400' :
                          track.action === '减仓' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          建议: {track.action}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                         <div>
                            <span className="text-gray-500 block text-xs">昨日评分</span>
                            <span className="font-mono text-gray-300">{track.yesterdayScore}</span>
                         </div>
                         <div>
                            <span className="text-gray-500 block text-xs">今日评分</span>
                            <span className={`font-mono font-bold ${track.todayScore >= track.yesterdayScore ? 'text-stockRed' : 'text-stockGreen'}`}>
                              {track.todayScore}
                            </span>
                         </div>
                         <div>
                            <span className="text-gray-500 block text-xs">今日涨跌</span>
                            <span className={`font-mono font-bold ${track.stock.changePercent > 0 ? 'text-stockRed' : 'text-stockGreen'}`}>
                              {track.stock.changePercent > 0 ? '+' : ''}{(track.stock.changePercent ?? 0).toFixed(2)}%
                            </span>
                         </div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded text-sm text-gray-300 border-l-2 border-slate-600">
                        <span className="font-bold text-slate-400 mr-2">策略逻辑:</span>
                        {track.comment}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* SMART MONEY VIEW */}
        {activeTab === 'smartmoney' && hotspots.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">顶级游资动向 (龙虎榜分析)</h2>
                <button 
                    onClick={handleSmartMoneyRefresh}
                    disabled={isLoadingInvestors}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-all border border-slate-600 shadow-sm disabled:opacity-50"
                >
                    {isLoadingInvestors ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>刷新游资数据</span>
                </button>
            </div>
            
             <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg text-sm text-blue-200/80 mb-6 flex items-start gap-3">
               <Info className="w-5 h-5 shrink-0 mt-0.5" />
               <div>
                  <p className="font-bold mb-1">数据说明：</p>
                  <p>游资席位数据基于公开龙虎榜信息聚合。AI 分析了游资联动、机构参与度以及资金操作手法（如低吸、打板）。</p>
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 relative">
              {isLoadingInvestors && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                      <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 text-accent animate-spin mb-2" />
                          <span className="text-sm text-gray-300">正在更新游资数据...</span>
                      </div>
                  </div>
              )}
              {investors.length === 0 && !isLoadingInvestors && (
                 <div className="col-span-2 text-center py-10 text-gray-500 bg-cardBg rounded-xl border border-slate-700">
                    暂无游资数据，请尝试刷新。
                 </div>
              )}
              {investors.map((inv, idx) => (
                <div key={idx} className="bg-cardBg border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                         {inv.name}
                         {inv.seat.includes('机构') && <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded">机构</span>}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{inv.seat}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                       <Users className="text-purple-400 w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="p-0">
                     {inv.topBuys.length > 0 ? (
                        <div className="divide-y divide-slate-700">
                            {inv.topBuys.map((buy, i) => (
                                <div key={`b-${i}`} className="p-4 hover:bg-slate-800/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <a 
                                               href={getTonghuashunLink(buy.stockCode)}
                                               target="_blank"
                                               rel="noreferrer"
                                               className="text-white font-bold text-base hover:text-accent transition-colors flex items-center gap-1"
                                            >
                                                {buy.stockName}
                                                <ExternalLink className="w-3 h-3 text-gray-500" />
                                            </a>
                                            <span className="text-xs text-gray-500 font-mono">{buy.stockCode}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 mb-0.5">净买入(万)</div>
                                            <div className={`font-mono font-bold ${buy.netBuy >= 0 ? 'text-stockRed' : 'text-stockGreen'}`}>
                                                {buy.netBuy > 0 ? '+' : ''}{buy.netBuy}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Indicators Tags */}
                                    {buy.indicators && buy.indicators.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {buy.indicators.map((tag, tIdx) => (
                                                <span key={tIdx} className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1
                                                    ${tag.includes('机构') ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 
                                                      tag.includes('联动') ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                                                      tag.includes('低吸') ? 'bg-green-500/10 text-green-300 border-green-500/30' :
                                                      'bg-slate-700 text-gray-300 border-slate-600'}
                                                `}>
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="text-sm text-gray-400 bg-slate-800/50 p-2 rounded border-l-2 border-slate-600">
                                        <span className="font-bold text-slate-500 mr-1">逻辑:</span>
                                        {buy.reason}
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                         <p className="text-gray-500 text-sm text-center py-6">今日暂无公开上榜数据</p>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI REPORT VIEW */}
        {activeTab === 'report' && hotspots.length > 0 && (
          <div className="animate-fade-in max-w-4xl mx-auto">
             <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <div className={`w-2 h-8 rounded-full ${provider === 'DeepSeek' ? 'bg-indigo-500' : 'bg-accent'}`}></div>
                      AI 深度投研报告
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        由 {provider === 'DeepSeek' ? 'DeepSeek V3' : 'OpenAI GPT'} 驱动 · 
                        {provider === 'DeepSeek' ? ' 模拟 Akshare/RQData 数据' : ' 基于推理/搜索数据'}
                    </p>
                  </div>
                  <button 
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="px-6 py-2 bg-accent hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        分析生成中...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        生成今日研报
                      </>
                    )}
                  </button>
                </div>

                {reportContent ? (
                  <article className="prose prose-invert prose-slate max-w-none">
                     <ReactMarkdown>{reportContent}</ReactMarkdown>
                  </article>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 opacity-50" />
                    </div>
                    <p>点击上方按钮生成今日投资分析报告</p>
                  </div>
                )}
             </div>

             {/* CHAT INTERFACE */}
             <div className="mt-8 bg-cardBg rounded-xl border border-slate-700 p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-accent" />
                  智能问答 ({provider})
                </h3>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    placeholder="例如：万丰奥威的上涨逻辑是什么？"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  />
                  <button 
                    onClick={handleChat}
                    disabled={isChatting || !chatQuery}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {isChatting ? '...' : '提问'}
                  </button>
                </div>
                {chatResponse && (
                  <div className="bg-slate-800/50 p-4 rounded-lg text-sm text-gray-300 animate-fade-in">
                    <div className="font-bold text-accent mb-1">AI 回答:</div>
                    <ReactMarkdown>{chatResponse}</ReactMarkdown>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* STOCK ANALYSIS VIEW */}
        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <StockAnalyze provider={provider} />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 mt-12 bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-xs">
          <p className="mb-2">© 2024 智投热点助手 Smart Invest. All rights reserved.</p>
          <p>
            免责声明：本应用数据为 AI 模拟或搜索聚合，仅供参考，不构成投资建议。
            {provider === 'DeepSeek' && ' 当前模式基于 DeepSeek 模拟 Akshare 数据逻辑。'}
          </p>
        </div>
      </footer>
    </div>
  );
}
