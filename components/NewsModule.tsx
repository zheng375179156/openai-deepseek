import React from 'react';
import { NewsItem } from '../types';
import { Bell, ExternalLink } from 'lucide-react';

interface NewsModuleProps {
  news: NewsItem[];
}

const NewsModule: React.FC<NewsModuleProps> = ({ news }) => {
  return (
    <div className="bg-cardBg rounded-xl border border-slate-700 p-0 overflow-hidden shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          7x24h 财经快讯
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
           实时推送
        </div>
      </div>
      
      <div className="overflow-y-auto custom-scrollbar p-4 space-y-6 flex-1 max-h-[500px]">
        {news.map((item) => (
          <div key={item.id} className="relative pl-6 border-l border-slate-700 last:border-0 pb-2">
            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-600 border-2 border-slate-800"></div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                {item.time}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                item.type === 'positive' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                item.type === 'negative' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {item.tag}
              </span>
            </div>
            {item.url ? (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer"
                className="group block"
              >
                <h4 className="text-sm font-medium text-gray-200 mb-1 group-hover:text-accent transition-colors flex items-center gap-1">
                  {item.title}
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </h4>
              </a>
            ) : (
              <h4 className="text-sm font-medium text-gray-200 mb-1 hover:text-accent cursor-pointer transition-colors">
                {item.title}
              </h4>
            )}
            
            <p className="text-xs text-gray-500 leading-relaxed">
              {item.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsModule;
