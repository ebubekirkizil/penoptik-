"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface FinanceOverviewProps {
  monthlyData: {
    month: string;
    income: number;
    expense: number;
    profit: number;
  }[];
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: string;
}

export default function FinanceOverview({ monthlyData, totalIncome, totalExpense, netProfit, profitMargin }: FinanceOverviewProps) {
  
  const formattedData = useMemo(() => {
    return monthlyData.map(d => ({
      ...d,
      Gelir: d.income,
      Gider: d.expense,
      Kar: d.profit
    }));
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Toplam Gelir (Yıllık)</h3>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">₺{totalIncome.toLocaleString("tr-TR")}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Toplam Gider (Yıllık)</h3>
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-600">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">₺{totalExpense.toLocaleString("tr-TR")}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Net Kar</h3>
            <div className={`w-10 h-10 ${netProfit >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"} rounded-xl flex items-center justify-center`}>
              {netProfit >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
          </div>
          <p className={`text-2xl font-black ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {netProfit >= 0 ? "+" : ""}₺{netProfit.toLocaleString("tr-TR")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Kar Marjı</h3>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-primary">%{profitMargin}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Area Chart: Income vs Expense Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Aylık Gelir / Gider Endeksi</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-slate-500" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-slate-500" tickFormatter={(val) => `₺${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: 'var(--background)' }}
                  formatter={(value: any) => [`₺${Number(value).toLocaleString("tr-TR")}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area type="monotone" dataKey="Gelir" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Gider" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Profitability */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-[var(--border-color)]">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Aylık Net Kar</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-slate-500" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-slate-500" tickFormatter={(val) => `₺${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: 'var(--background)' }}
                  formatter={(value: any) => [`₺${Number(value).toLocaleString("tr-TR")}`, 'Net Kar']}
                />
                <Bar dataKey="Kar" radius={[6, 6, 6, 6]}>
                  {
                    formattedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Kar >= 0 ? '#10b981' : '#ef4444'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
