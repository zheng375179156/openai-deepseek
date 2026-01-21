
import React, { useState, useEffect } from 'react';
import { Holding, AIProvider } from '../types';
import { Plus, Trash2, PieChart, RefreshCw, TrendingUp, TrendingDown, Minus, BrainCircuit, Loader2, CheckCircle2, ExternalLink, Activity, Target, Shield, Gauge, Zap, FileText, BarChart3, LineChart, AlertTriangle } from 'lucide-react';
import { analyzeHoldingsDispatcher, searchStockDispatcher, generateHoldingsReportDispatcher } from '../services/marketService';
import ReactMarkdown from 'react-markdown';

interface HoldingsModuleProps {
  holdings: Holding[];
  setHoldings: (holdings: Holding[]) => void;
  provider: AIProvider;
}

const HoldingsModule: React.FC<HoldingsModuleProps> = ({ holdings, setHoldings, provider }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Report State
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');

  // Minimal Form State
  const [inputCode, setInputCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundStock, setFoundStock] = useState<{ name: string, price: number, changePercent?: number } | null>(null);
  const [searchError, setSearchError] = useState('');

  // Auto-search effect
  useEffect(() => {
    if (inputCode.length === 6) {
        handleSearch(inputCode);
    } else {
        setFoundStock(null);
        setSearchError('');
    }
  }, [inputCode]);

  const handleSearch = async (code: string) => {
    setIsSearching(true);
    setSearchError('');
    setFoundStock(null);
    try {
        const result = await searchStockDispatcher(provider, code);
        if (result && result.name) {
            setFoundStock(result);
        } else {
            setSearchError('未找到该股票信息，请检查代码');
        }
    } catch (e) {
        setSearchError('查询失败，请检查网络');
    } finally {
        setIsSearching(false);
    }
  };

  const confirmAddStock = () => {
    if (!foundStock || !inputCode) return;
    
    // Check if already exists
    if (holdings.some(h => h.code === inputCode)) {
        alert('该股票已在持仓列表中');
        return;
    }

    const newItem: Holding = {
      code: inputCode,
      name: foundStock.name,
      costPrice: foundStock.price, // Default to current price
      quantity: 100, // Default to 1 hand
      currentPrice: foundStock.price,
      changePercent: foundStock.changePercent || 0,
      aiAdvice: '观望' // Initial state
    };

    const updated = [...holdings, newItem];
    setHoldings(updated);
    
    // Reset and Close
    closeModal();
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setInputCode('');
      setFoundStock(null);
      setSearchError('');
  };

  const removeStock = (code: string) => {
    setHoldings(holdings.filter(h => h.code !== code));
  };

  const handleAnalyze = async () => {
    if (holdings.length === 0) return;
    setIsAnalyzing(true);
    try {
        const analyzed = await analyzeHoldingsDispatcher(provider, holdings);
        setHoldings(analyzed);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
      if (holdings.length === 0) return;
      setIsGeneratingReport(true);
      try {
          const report = await generateHoldingsReportDispatcher(provider, holdings);
          setReportContent(report);
          setIsReportModalOpen(true);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingReport(false);
      }
  };

  const calculateTotalMarketValue = () => {
    return holdings.reduce((acc, curr) => {
      const current = curr.currentPrice || curr.costPrice;
      return acc + (current * curr.quantity);
    }, 0);
  };

  const getTonghuashunLink = (code: string) => {
    const pureCode = code.replace(/\D/g, '');
    return `http://stockpage.10jqka.com.cn/${pureCode}/`;
  };
  
  const totalMarketValue = calculateTotalMarketValue();
  
  // Helper to parse percentage string like "+20%" to 0.2
  const parsePercentage = (str?: string): number => {
      if (!str) return 0;
      const clean = str.replace('%', '').replace('+', '');
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num / 100;
  };

  // Helper for sentiment color
  const getSentimentColor = (score?: number) => {
      if (score === undefined) return 'bg-slate-700';
      if (score >= 80) return 'bg-red-500'; // High emotion
      if (score >= 60) return 'bg-orange-500';
      if (score >= 40) return 'bg-yellow-500';
      if (score >= 20) return 'bg-blue-500';
      return 'bg-green-500'; // Panic/Low
  };

  // Check if analysis has run (check if any holding has aiAdvice)
  const hasAnalysis = holdings.some(h => !!h.aiAdvice);

  return (
    <div className="animate-fade-in pb-10">
        {/* Header Summary */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 mb-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <PieChart className="w-6 h-6 text-accent" />
                    持仓市值管理
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    AI 模拟顶级游资操盘逻辑 · 未来市值趋势预测
                </p>
            </div>
            
            <div className="flex items-center gap-6">
                 <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">当前总市值 (CNY)</div>
                    <div className="text-2xl font-mono font-bold text-white">
                        ¥ {totalMarketValue.toLocaleString()}
                    </div>
                 </div>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">添加股票</span>
                    <span className="sm:hidden">添加</span>
                </button>
                <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || holdings.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-md transition-all shadow-lg shadow-indigo-900/30 disabled:opacity-50 disabled:shadow-none"
                    >
                        {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                        <span>游资诊断 + 预测</span>
                    </button>
                    {hasAnalysis && (
                        <button 
                            onClick={handleGenerateReport}
                            disabled={isGeneratingReport}
                            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-md transition-all ml-1 disabled:opacity-50"
                            title="生成研报"
                        >
                             {isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                             <span className="hidden sm:inline">生成研报</span>
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Holdings List */}
        <div className="grid gap-6">
            {holdings.length === 0 && (
                <div className="text-center py-16 bg-cardBg rounded-xl border border-slate-700 border-dashed">
                    <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-gray-400">暂无持仓，点击上方“添加股票”开始管理</p>
                </div>
            )}

            {holdings.map((h, idx) => {
                const currentMarketValue = (h.currentPrice || h.costPrice) * h.quantity;
                
                // Calculate Predicted Value
                const predictedRate = parsePercentage(h.projectedChange1Year);
                const predictedMarketValue = currentMarketValue * (1 + predictedRate);
                const isProjectedUp = predictedRate >= 0;

                return (
                    <div key={idx} className="bg-cardBg rounded-xl border border-slate-700 shadow-md hover:border-slate-600 transition-colors overflow-hidden flex flex-col lg:flex-row">
                        
                        {/* LEFT: Stock Basic Info (35%) */}
                        <div className="p-5 bg-slate-800/30 border-b lg:border-b-0 lg:border-r border-slate-700 lg:w-[350px] shrink-0 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <a 
                                        href={getTonghuashunLink(h.code)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group/link flex items-center gap-2 hover:opacity-80 transition-opacity"
                                    >
                                        <h3 className="text-xl font-bold text-white group-hover/link:text-accent transition-colors flex items-center gap-1">
                                            {h.name}
                                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover/link:text-accent" />
                                        </h3>
                                    </a>
                                    <span className="text-xs font-mono text-gray-500">{h.code}</span>
                                </div>
                                <div className={`px-3 py-1 rounded text-sm font-bold flex items-center gap-1 ${
                                    (h.changePercent || 0) >= 0 ? 'bg-stockRed/10 text-stockRed' : 'bg-stockGreen/10 text-stockGreen'
                                }`}>
                                    {(h.changePercent || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {(h.changePercent || 0) > 0 ? '+' : ''}{(h.changePercent || 0).toFixed(2)}%
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <span className="block text-xs text-gray-500 mb-0.5">现价</span>
                                    <span className="font-mono text-white text-lg font-bold">{h.currentPrice?.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 mb-0.5">持仓数量</span>
                                    <span className="font-mono text-gray-300">{h.quantity}</span>
                                </div>
                            </div>

                            {/* Current Market Value */}
                            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 mb-3">
                                <span className="text-xs text-gray-500 block mb-1">目前股票市值</span>
                                <div className="font-mono text-white text-xl font-bold">
                                    ¥ {currentMarketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>

                            {/* Future Projected Value */}
                            {h.projectedChange1Year ? (
                                <div className={`p-3 rounded-lg border flex flex-col ${isProjectedUp ? 'bg-purple-900/20 border-purple-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-purple-300 flex items-center gap-1">
                                            <LineChart className="w-3 h-3" />
                                            一年内预计市值
                                        </span>
                                        <span className={`text-xs font-bold ${isProjectedUp ? 'text-red-400' : 'text-green-400'}`}>
                                            {h.projectedChange1Year}
                                        </span>
                                    </div>
                                    <div className="font-mono text-white text-lg font-bold">
                                        ¥ {predictedMarketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-center justify-center text-xs text-gray-500 h-[66px]">
                                    待诊断获取未来预测
                                </div>
                            )}
                            
                            <button 
                                onClick={() => removeStock(h.code)}
                                className="absolute top-4 right-4 text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all"
                                title="删除持仓"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* RIGHT: Youzi Analysis (65%) */}
                        <div className="flex-1 p-5 relative">
                            {!h.aiAdvice ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 min-h-[150px]">
                                    <BrainCircuit className="w-10 h-10 mb-2" />
                                    <p className="text-sm">点击上方“游资诊断”获取未来一年市值预测</p>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    {/* Top Row: Mood & Advice */}
                                    <div className="flex flex-wrap items-center gap-4 border-b border-slate-700/50 pb-4">
                                        
                                        {/* Advice Badge */}
                                        <div className={`px-4 py-1.5 rounded-full font-bold text-sm border shadow-sm ${
                                            h.aiAdvice.includes('强力持有') ? 'bg-red-600 text-white border-red-500' :
                                            h.aiAdvice.includes('持有') ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                            h.aiAdvice.includes('减仓') ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                                            h.aiAdvice.includes('清仓') ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                            'bg-slate-700 text-gray-300 border-slate-600'
                                        }`}>
                                            建议: {h.aiAdvice}
                                        </div>

                                        {/* Sentiment Bar */}
                                        <div className="flex-1 min-w-[200px] flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                                                <Gauge className="w-3.5 h-3.5" />
                                                <span>市场情绪:</span>
                                            </div>
                                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden relative group/tooltip cursor-help">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${getSentimentColor(h.sentimentScore)}`} 
                                                    style={{ width: `${h.sentimentScore || 50}%` }}
                                                ></div>
                                                {/* Tooltip for Sentiment */}
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded border border-slate-600 opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    评分: {h.sentimentScore || 'N/A'} (0=冰点, 100=高潮)
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 w-12 text-right">
                                                {h.sentimentScore || '-'}分
                                            </span>
                                        </div>
                                    </div>

                                    {/* MAIN FORCE INTENT SECTION (New) */}
                                    {h.mainForceStatus && (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border flex-shrink-0 ${
                                                h.mainForceStatus.includes('洗盘') ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                                                h.mainForceStatus.includes('出货') ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                                                h.mainForceStatus.includes('主升') ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                                                'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                            }`}>
                                                <Activity className="w-4 h-4" />
                                                <span className="font-bold text-sm">{h.mainForceStatus}</span>
                                            </div>
                                            <div className="flex-1 bg-slate-800/50 rounded-lg p-2 border border-slate-700/50 text-xs text-gray-300 flex items-center">
                                                <span className="font-bold mr-1 opacity-70">判定逻辑:</span>
                                                {h.mainForceReason || 'AI 综合量价分析得出'}
                                            </div>
                                        </div>
                                    )}

                                    {/* Prediction Row */}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                         <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-500/20 px-3 py-1.5 rounded flex-1 min-w-[140px]">
                                            <Zap className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-xs text-blue-200">明日预测:</span>
                                            <span className="font-bold font-mono text-white">{h.predictedNextChange || '--'}</span>
                                         </div>
                                         
                                         {h.projectedChange1Year && (
                                            <div className="flex items-center gap-2 bg-purple-900/20 border border-purple-500/20 px-3 py-1.5 rounded flex-[2] min-w-[200px]">
                                                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                                                <span className="text-xs text-purple-200">未来一年趋势:</span>
                                                <span className="font-bold text-white text-xs line-clamp-1" title={h.predictionLogic1Year}>
                                                    {h.predictionLogic1Year}
                                                </span>
                                            </div>
                                         )}
                                    </div>

                                    {/* Detailed Strategy Note */}
                                    {h.detailedStrategy && (
                                        <div className="mt-2 bg-slate-900/50 rounded-lg p-3 text-sm text-gray-300 border border-slate-700/50">
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5 min-w-[4px] h-4 bg-accent rounded-full"></div>
                                                <p className="leading-relaxed opacity-90 text-xs sm:text-sm font-mono">
                                                    <span className="text-accent font-bold mr-1">[操盘策略]</span>
                                                    {h.detailedStrategy}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>

        {/* Add Stock Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">添加持仓股票</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-white"><Minus className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-xs text-gray-400 block mb-2">请输入 6 位股票代码</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-lg text-white focus:border-accent outline-none font-mono tracking-widest text-center"
                                    placeholder="000000"
                                    value={inputCode}
                                    onChange={e => setInputCode(e.target.value.replace(/\D/g,''))}
                                    maxLength={6}
                                    autoFocus
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-3.5">
                                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Search Result / Status */}
                        <div className="min-h-[80px] bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex flex-col items-center justify-center text-center">
                            {isSearching ? (
                                <span className="text-sm text-gray-400">正在获取实盘行情...</span>
                            ) : searchError ? (
                                <span className="text-sm text-red-400">{searchError}</span>
                            ) : foundStock ? (
                                <div className="animate-fade-in w-full">
                                    <div className="text-sm text-gray-400 mb-1">实盘数据</div>
                                    <div className="text-xl font-bold text-white flex items-center justify-center gap-2">
                                        {foundStock.name}
                                        <span className={(foundStock.changePercent || 0) >= 0 ? 'text-stockRed' : 'text-stockGreen'}>
                                            {foundStock.price}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        当日涨跌: 
                                        <span className={(foundStock.changePercent || 0) >= 0 ? 'text-stockRed ml-1' : 'text-stockGreen ml-1'}>
                                           {(foundStock.changePercent || 0) > 0 ? '+' : ''}{(foundStock.changePercent || 0).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 border-t border-slate-700 pt-2 flex justify-between px-4">
                                        <span>默认持仓: 100股</span>
                                        <span>当前价格作为成本</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-500">输入代码自动匹配</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button 
                            onClick={confirmAddStock}
                            disabled={!foundStock}
                            className="w-full px-4 py-3 bg-accent hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
                        >
                            {foundStock ? <CheckCircle2 className="w-5 h-5" /> : null}
                            {foundStock ? '确认添加' : '请输入代码'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Report Viewing Modal */}
        {isReportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl animate-fade-in">
                    <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-2xl">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-accent" />
                            持仓深度研报
                        </h3>
                        <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded hover:bg-slate-700">
                            <Minus className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <article className="prose prose-invert prose-slate max-w-none prose-p:text-sm prose-headings:text-gray-200">
                            <ReactMarkdown>{reportContent}</ReactMarkdown>
                        </article>
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-800/30 text-center text-xs text-gray-500">
                        研报由 AI 实时生成，仅供参考，不构成投资建议
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default HoldingsModule;
