
import React from 'react';
import { MarketSentiment } from '../types';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Zap, Shield, Rocket } from 'lucide-react';

interface Props {
  sentiment: MarketSentiment;
}

const SentimentGauge: React.FC<Props> = ({ sentiment }) => {
  const { score, cycleStage, warning, suggestion, trend, safeHavenSectors, nextHotSectors } = sentiment;

  // Determine colors based on score/temperature
  const getColors = (score: number) => {
    if (score >= 80) return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', label: '极热/风险' };
    if (score >= 60) return { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', label: '火热/主升' };
    if (score >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500', label: '回暖/震荡' };
    if (score >= 20) return { bg: 'bg-blue-400', text: 'text-blue-400', border: 'border-blue-400', label: '寒冷/磨底' };
    return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', label: '冰点/绝望' };
  };

  const colors = getColors(score);

  return (
    <div className="bg-cardBg rounded-xl border border-slate-700 p-5 shadow-lg relative overflow-hidden mb-6">
       {/* Background Decoration */}
       <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} opacity-5 rounded-full blur-3xl -mr-10 -mt-10`}></div>

       <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Left: Gauge & Score */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-auto pt-2">
             <div className="relative w-32 h-16 overflow-hidden mb-2">
                <div className="absolute top-0 left-0 w-full h-32 bg-slate-800 rounded-full border-8 border-slate-700 box-border"></div>
                <div 
                    className={`absolute top-0 left-0 w-full h-32 rounded-full border-8 ${colors.border} border-b-transparent border-r-transparent transition-all duration-1000 ease-out`}
                    style={{ transform: `rotate(${(score / 100) * 180 - 135}deg)` }}
                ></div>
             </div>
             <div className="text-center -mt-8 relative z-10">
                <div className="text-3xl font-bold text-white font-mono">{score}</div>
                <div className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>{colors.label}</div>
             </div>
          </div>

          {/* Middle: Stage & Suggestion */}
          <div className="flex-1 w-full text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <Activity className="w-5 h-5 text-accent" />
                   市场情绪周期：
                   <span className={`${colors.text} px-2 py-0.5 bg-slate-800 rounded text-base border border-slate-700`}>
                      {cycleStage}
                   </span>
                </h3>
                {trend === 'Up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                {trend === 'Down' && <TrendingDown className="w-4 h-4 text-green-500" />}
             </div>
             <p className="text-sm text-gray-400 mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <span className="font-bold text-gray-300 mr-1">操作建议:</span>
                {suggestion}
             </p>
             
             {/* Sector Rotation Suggestions */}
             {(safeHavenSectors?.length || nextHotSectors?.length) ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    {/* Safe Haven */}
                    {safeHavenSectors && safeHavenSectors.length > 0 && (
                        <div className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700 flex flex-col relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-1 opacity-10">
                                <Shield className="w-8 h-8 text-emerald-500" />
                            </div>
                            <span className="text-xs text-gray-400 flex items-center gap-1.5 mb-2 font-bold uppercase tracking-wider">
                                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                避险/防御方向
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {safeHavenSectors.map((s, i) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded font-medium">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Next Hot */}
                    {nextHotSectors && nextHotSectors.length > 0 && (
                        <div className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700 flex flex-col relative overflow-hidden">
                             <div className="absolute right-0 top-0 p-1 opacity-10">
                                <Rocket className="w-8 h-8 text-orange-500" />
                            </div>
                             <span className="text-xs text-gray-400 flex items-center gap-1.5 mb-2 font-bold uppercase tracking-wider">
                                <Rocket className="w-3.5 h-3.5 text-orange-400" />
                                潜伏/下一热点
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {nextHotSectors.map((s, i) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-orange-500/10 text-orange-300 border border-orange-500/20 rounded font-medium">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>
             ) : null}

             {/* Warning Banner - ONLY show if warning exists */}
             {warning && (
                 <div className="animate-pulse flex items-start gap-2 bg-red-500/10 border border-red-500/40 p-3 rounded-lg text-red-200 text-sm mt-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                    <div>
                        <span className="font-bold block text-red-400 mb-0.5">情绪拐点预警</span>
                        {warning}
                    </div>
                 </div>
             )}
             
             {!warning && score < 20 && (
                 <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/40 p-3 rounded-lg text-blue-200 text-sm mt-3">
                    <Zap className="w-5 h-5 shrink-0 text-blue-400" />
                    <div>
                        <span className="font-bold block text-blue-400 mb-0.5">冰点试错机会</span>
                        市场情绪极度低迷，可能随时出现报复性反弹，关注率先涨停的前排标的。
                    </div>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default SentimentGauge;
