
import React from 'react';
import { Hotspot, Stock } from '../types';
import { Flame, Star } from 'lucide-react';
import StockTable from './StockTable';

interface HotspotCardProps {
  hotspot: Hotspot;
  onAddToHoldings?: (stock: Stock) => void;
}

const HotspotCard: React.FC<HotspotCardProps> = ({ hotspot, onAddToHoldings }) => {
  return (
    <div className="bg-cardBg rounded-xl border border-slate-700 p-5 mb-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Flame className="w-6 h-6 text-stockRed" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {hotspot.title}
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {hotspot.type}
              </span>
            </h3>
            <div className="flex text-yellow-500 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < hotspot.rating ? 'fill-current' : 'text-slate-600'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-400 max-w-md text-right hidden md:block">
          {hotspot.description}
        </div>
      </div>
      
      <div className="md:hidden text-sm text-gray-400 mb-4 bg-slate-800/50 p-3 rounded">
        {hotspot.description}
      </div>

      <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden">
        <StockTable stocks={hotspot.stocks} onAddToHoldings={onAddToHoldings} />
      </div>
    </div>
  );
};

export default HotspotCard;
