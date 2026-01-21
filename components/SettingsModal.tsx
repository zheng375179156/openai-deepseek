import React, { useState, useEffect } from 'react';
import { X, Save, Key, Globe, Database, Server } from 'lucide-react';
import { AIProvider } from '../types';

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
        
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Server className="w-5 h-5 text-accent" />
            数据引擎配置
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Provider Selection */}
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

          {/* API Keys Config */}
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
                        <a href="https://platform.deepseek.com/" target="_blank" className="text-indigo-400 hover:underline ml-1">获取 Key</a>
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

        {/* Footer */}
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

export default SettingsModal;
