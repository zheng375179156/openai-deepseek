
import React from 'react';
import { Stock } from '../types';
import { TrendingUp, TrendingDown, Minus, ExternalLink, PlusCircle } from 'lucide-react';

interface StockTableProps {
  stocks: Stock[];
  showScore?: boolean;
  compact?: boolean;
  onAddToHoldings?: (stock: Stock) => void;
}

const StockTable: React.FC<StockTableProps> = ({ stocks, showScore = true, compact = false, onAddToHoldings }) => {
  
  const getChangeColor = (change: number) => {
    // Ensure change is treated as number for comparison
    const val = Number(change);
    if (val > 0) return 'text-stockRed';
    if (val < 0) return 'text-stockGreen';
    return 'text-gray-400';
  };

  const renderIcon = (change: number) => {
    const val = Number(change);
    if (val > 0) return <TrendingUp className="w-4 h-4 text-stockRed inline mr-1" />;
    if (val < 0) return <TrendingDown className="w-4 h-4 text-stockGreen inline mr-1" />;
    return <Minus className="w-4 h-4 text-gray-400 inline mr-1" />;
  };

  const getStockLink = (code: string) => {
    // Sanitize code: remove 'sh', 'sz' or any non-digit characters to ensure 10jqka url works
    const pureCode = code.replace(/\D/g, '');
    // 10jqka URL format: http://stockpage.10jqka.com.cn/[code]/
    return `http://stockpage.10jqka.com.cn/${pureCode}/`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-slate-800 text-xs uppercase text-gray-400">
          <tr>
            <th className="px-4 py-3">代码/名称</th>
            <th className="px-4 py-3">板块</th>
            <th className="px-4 py-3 text-right">现价</th>
            <th className="px-4 py-3 text-right">涨跌幅</th>
            {showScore && <th className="px-4 py-3 text-center">AI评分</th>}
            {!compact && <th className="px-4 py-3">关联逻辑</th>}
            {onAddToHoldings && <th className="px-4 py-3 text-center w-16">操作</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {stocks.map((stock) => (
            <tr key={stock.code} className="hover:bg-slate-800/50 transition-colors">
              <td className="px-4 py-3">
                 <a 
                    href={getStockLink(stock.code)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group block cursor-pointer"
                    title="点击前往同花顺查看个股详情"
                  >
                    <div className="font-bold text-white group-hover:text-accent transition-colors flex items-center gap-1">
                      {stock.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-accent/80 transition-colors underline decoration-dotted underline-offset-2">
                        {stock.code.replace(/\D/g, '')}
                    </div>
                  </a>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">
                  {stock.sector}
                </span>
              </td>
              <td className={`px-4 py-3 text-right font-mono font-medium ${getChangeColor(stock.changePercent)}`}>
                {Number(stock.price ?? 0).toFixed(2)}
              </td>
              <td className={`px-4 py-3 text-right font-mono font-medium ${getChangeColor(stock.changePercent)}`}>
                {renderIcon(stock.changePercent)}
                {Number(stock.changePercent) > 0 ? '+' : ''}{Number(stock.changePercent ?? 0).toFixed(2)}%
              </td>
              {showScore && (
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900 text-indigo-200 text-xs font-bold border border-indigo-700">
                    {stock.score}
                  </div>
                </td>
              )}
              {!compact && (
                <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">
                  {stock.reason}
                </td>
              )}
              {onAddToHoldings && (
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => onAddToHoldings(stock)}
                    className="text-gray-400 hover:text-accent hover:bg-slate-700 p-1.5 rounded transition-all"
                    title="加入持仓管理"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
