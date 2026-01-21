import React, { useState } from 'react';
import { AIProvider } from '../types';
import { Loader2, ShieldCheck, AlertTriangle, Send } from 'lucide-react';

type FormState = {
  code: string;
  name: string;
  sector: string;
  marketTheme: string;
  recentTrend: string;
};

const DEFAULT_FORM: FormState = {
  code: '',
  name: '',
  sector: '',
  marketTheme: '',
  recentTrend: '',
};

const getApiKey = (provider: AIProvider) => {
  if (provider === 'DeepSeek') {
    const storedKey = localStorage.getItem('deepseek_api_key');
    // @ts-ignore
    const envKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    return storedKey || envKey || '';
  }
  const storedKey = localStorage.getItem('openai_api_key');
  // @ts-ignore
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  return storedKey || envKey || '';
};

const StockAnalyze: React.FC<{ provider: AIProvider }> = ({ provider }) => {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = async () => {
    setError(null);
    setResult('');
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      setError('请先在右上角“数据引擎配置”里填写 API Key。');
      return;
    }
    if (!form.code.trim()) {
      setError('请输入股票代码');
      return;
    }
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (provider === 'DeepSeek') headers['x-deepseek-key'] = apiKey;
      else headers['x-openai-key'] = apiKey;

      const res = await fetch('/api/analyze-stock', {
        method: 'POST',
        headers,
        body: JSON.stringify({ provider, ...form }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data.result || '无返回内容');
    } catch (e: any) {
      setError(e.message || '分析失败');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Loader2 className="w-4 h-4 animate-spin" />
          正在生成策略，请稍候...
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center gap-2 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      );
    }
    if (result) {
      return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
          {result}
        </div>
      );
    }
    return (
      <div className="text-gray-500 text-sm">
        填写信息后点击「一键分析」，AI 将给出龙头/主升/风控视角的操作建议。
      </div>
    );
  };

  return (
    <div className="bg-cardBg rounded-2xl border border-slate-700 p-6 shadow-lg space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/20 border border-accent/40">
          <ShieldCheck className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">个股策略分析</h2>
          <p className="text-xs text-gray-400">
            基于“热点龙头 + 主升右侧 + 风控纪律”输出结构化建议（{provider}）
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">股票代码 *</label>
          <input
            value={form.code}
            onChange={e => onChange('code', e.target.value)}
            placeholder="如：600519 / 000001 / 300750"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">股票名称</label>
          <input
            value={form.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="可留空，例：贵州茅台"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">所属板块</label>
          <input
            value={form.sector}
            onChange={e => onChange('sector', e.target.value)}
            placeholder="如：白酒 / 半导体 / 低空经济"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">当前市场主线</label>
          <input
            value={form.marketTheme}
            onChange={e => onChange('marketTheme', e.target.value)}
            placeholder="如：AI 应用 / 国企改革 / 低空经济"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">近期走势摘要（5~20日）</label>
          <textarea
            value={form.recentTrend}
            onChange={e => onChange('recentTrend', e.target.value)}
            placeholder="例：近10日沿5日线上行，量能温和放大；MACD零轴上方，二次金叉；KDJ强势钝化。"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent h-24"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-4 py-2 bg-accent hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          一键分析
        </button>
        <button
          onClick={() => { setForm(DEFAULT_FORM); setResult(''); setError(null); }}
          className="px-3 py-2 text-xs text-gray-400 hover:text-white border border-slate-700 rounded-lg"
        >
          重置
        </button>
        <div className="text-xs text-gray-500">
          提示：未填写名称/板块也可生成，但建议补充以提升上下文质量。
        </div>
      </div>

      {renderResult()}
    </div>
  );
};

export default StockAnalyze;

