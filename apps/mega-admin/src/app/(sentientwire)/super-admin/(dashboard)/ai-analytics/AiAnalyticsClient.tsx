"use client";

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  Activity, DollarSign, MessageSquare, AlertTriangle, ChevronDown, ChevronUp, Clock, Info, Zap
} from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

interface Log {
  id: string;
  firm: { name: string } | null;
  query: string;
  responseSummary: string | null;
  source: string;
  modelUsed: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  isError: boolean;
  errorMessage: string | null;
  createdAt: Date;
}

interface AiAnalyticsClientProps {
  logs: Log[];
  totalTokens: number;
  totalCost: number;
  totalQueries: number;
  totalErrors: number;
  modelUsageData: { name: string, value: number }[];
  firmUsageData: { name: string, value: number }[];
  timelineData: { date: string, tokens: number, cost: number }[];
}

export default function AiAnalyticsClient({
  logs,
  totalTokens,
  totalCost,
  totalQueries,
  totalErrors,
  modelUsageData,
  firmUsageData,
  timelineData
}: AiAnalyticsClientProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  // Quota Calculations — Toplam kapasite: 500 + 500 + 20 + 20 + 20 = 1060 RPD
  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = logs.filter(log => new Date(log.createdAt).toISOString().split('T')[0] === today);
  const todaysQueries = todaysLogs.length;
  const todaysTokens = todaysLogs.reduce((acc, log) => acc + log.totalTokens, 0);

  const MAX_RPD = 1060;
  const rpdPercentage = Math.min((todaysQueries / MAX_RPD) * 100, 100);

  let recommendationMessage = "";
  let recommendationColor = "";
  
  if (rpdPercentage === 0) {
    recommendationMessage = "Bugün henüz hiç istek yapılmadı. 5 model arasında toplam 1.060 ücretsiz istek hakkınız kullanıma hazır.";
    recommendationColor = "text-slate-600 dark:text-slate-400";
  } else if (rpdPercentage < 50) {
    recommendationMessage = `Harika gidiyorsunuz! Bugün toplam 1.060 ücretsiz sorgu hakkınızın sadece ${todaysQueries.toLocaleString()}'ini kullandınız. Ekstra hiçbir fatura çıkmayacaktır.`;
    recommendationColor = "text-emerald-600 dark:text-emerald-400";
  } else if (rpdPercentage < 90) {
    recommendationMessage = `Kullanım limitinizin %${rpdPercentage.toFixed(1)} kadarına ulaxtınız. Toplam 1.060 günlük istek sınırına yaklaxıyorsunuz.`;
    recommendationColor = "text-amber-600 dark:text-amber-500";
  } else {
    recommendationMessage = `DİKKAT! Günlük ücretsiz limitinizin %${rpdPercentage.toFixed(1)}'ini doldurdunuz. Sınır axıldığında istek baxı ücretlendirme yansıtılacaktır.`;
    recommendationColor = "text-red-600 dark:text-red-400";
  }

  return (
    <div className="space-y-6">
      
      {/* Smart Recommendation & Quotas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl border border-indigo-800/50 p-6 shadow-lg shadow-indigo-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
                <Info className="w-5 h-5 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Akıllı Asistan Analizi</h3>
            </div>
            <p className="text-indigo-200 text-lg mb-6 leading-relaxed">
              {recommendationMessage}
            </p>
            
            <div className="bg-slate-900/60 rounded-xl p-4 border border-indigo-500/20">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-400">Toplam Günlük İstek Kapasitesi (5 Model)</p>
                  <p className="text-2xl font-bold text-white mt-1">{todaysQueries.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ 1.060</span></p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    rpdPercentage < 50 ? 'text-emerald-400' : rpdPercentage < 90 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    %{rpdPercentage.toFixed(1)} Dolu
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    rpdPercentage < 50 ? 'bg-emerald-500' : rpdPercentage < 90 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${rpdPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Model Kotaları (Günlük RPD)</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Gemini 3.5 Flash Lite</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg text-sm">500</span>
            </li>
            <li className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Gemini 3.1 Flash Lite</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg text-sm">500</span>
            </li>
            <li className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Gemini 3.5 Flash</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-lg text-sm">20</span>
            </li>
            <li className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Gemini 2.5 Flash</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-lg text-sm">20</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Gemini 3.6 Flash</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-lg text-sm">20</span>
            </li>
          </ul>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4 hover:border-purple-500/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Toplam Token</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalTokens.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4 hover:border-emerald-500/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Toplam Maliyet ($)</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">${totalCost.toFixed(4)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4 hover:border-blue-500/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Toplam Sorgu</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalQueries.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4 hover:border-red-500/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Hatalı Sorgular</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalErrors.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Günlük Token Kullanımı</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="tokens" name="Token" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Firm Usage Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Müxteri Bazlı Token Dağılımı</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={firmUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {firmUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Models Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Model Kullanım İstatistikleri</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelUsageData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              />
              <Bar dataKey="value" name="İstek Sayısı" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                {modelUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Son İxlemler (AI History)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Tarih</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Müxteri (Firma)</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Kullanılan Model</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">Maliyet ($)</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">Token</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-center">Durum</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Henüz AI kullanım kaydı bulunmamaktadır.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(log.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900 dark:text-white">{log.firm?.name || 'Bilinmiyor'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                        {log.modelUsed || log.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      ${log.cost.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-slate-900 dark:text-white font-medium">{log.totalTokens.toLocaleString()}</span>
                      <span className="text-slate-400 text-xs ml-1 block mt-0.5">({log.promptTokens} in / {log.completionTokens} out)</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.isError ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Hata
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-semibold">
                          Baxarılı
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleExpand(log.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                      >
                        {expandedLogId === log.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                  {/* Expanded Row */}
                  {expandedLogId === log.id && (
                    <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                      <td colSpan={7} className="px-6 py-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" /> Prompt (Soru)
                            </h4>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                              {log.query}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                              {log.isError ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Activity className="w-4 h-4 text-emerald-500" />} 
                              {log.isError ? 'Hata Detayı' : 'AI Yanıtı'}
                            </h4>
                            <div className={`p-4 rounded-xl border text-sm whitespace-pre-wrap ${
                              log.isError 
                                ? 'bg-red-50 border-red-100 dark:bg-red-500/5 dark:border-red-900/50 text-red-700 dark:text-red-400' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {log.isError ? log.errorMessage : (log.responseSummary || 'Yanıt özeti yok.')}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
