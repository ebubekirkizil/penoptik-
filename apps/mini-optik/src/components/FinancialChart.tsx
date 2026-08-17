"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from "recharts";
import { TrendingUp, Wallet, Info } from "lucide-react";

type Order = {
  id: string;
  totalPrice: number | null;
  deposit: number | null;
  createdAt: string;
};

const WEEK_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export default function FinancialChart({ orders }: { orders: Order[] }) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "ALL">("30D");
  const [isMobile, setIsMobile] = useState(false);
  const [showIncome, setShowIncome] = useState(true);
  const [showDeposit, setShowDeposit] = useState(true);

  useEffect(() => {
    const savedTime = localStorage.getItem("optisyen_chart_timeRange");
    if (savedTime === "7D" || savedTime === "30D" || savedTime === "ALL") setTimeRange(savedTime);
    
    const savedInc = localStorage.getItem("optisyen_chart_inc");
    if (savedInc !== null) setShowIncome(savedInc === "true");
    
    const savedDep = localStorage.getItem("optisyen_chart_dep");
    if (savedDep !== null) setShowDeposit(savedDep === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("optisyen_chart_timeRange", timeRange);
    localStorage.setItem("optisyen_chart_inc", showIncome.toString());
    localStorage.setItem("optisyen_chart_dep", showDeposit.toString());
  }, [timeRange, showIncome, showDeposit]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const data = useMemo(() => {
    const now = new Date();
    let filteredOrders = orders;

    if (timeRange === "7D") {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 7);
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= past7);
    } else if (timeRange === "30D") {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 30);
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= past30);
    }

    const grouped: Record<string, { sortKey: number, date: string; income: number; deposit: number }> = {};

    const processItem = (dateStrISO: string, income: number, deposit: number) => {
      const d = new Date(dateStrISO);
      let label = "";
      let sortKey = d.getTime();

      if (timeRange === "7D") {
        label = WEEK_DAYS[d.getDay()];
      } else if (timeRange === "30D") {
        label = d.toLocaleDateString("tr-TR", { month: "short", day: "numeric" });
      } else {
        label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        sortKey = d.getFullYear() * 100 + d.getMonth();
      }

      let groupKey = "";
      if (timeRange === "ALL") {
        groupKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      } else {
        groupKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = { sortKey, date: label, income: 0, deposit: 0 };
      }
      
      grouped[groupKey].income += income;
      grouped[groupKey].deposit += deposit;
    };

    filteredOrders.forEach(o => processItem(o.createdAt, o.totalPrice || 0, o.deposit || 0));
    const finalData = Object.values(grouped).sort((a, b) => a.sortKey - b.sortKey);
    
    // Eğer sadece 1 veri noktası varsa, grafik çizgi çizemez (sadece nokta çıkar). 
    // Öncesine 0 değerinde bir başlangıç noktası ekleyerek grafiğin 0'dan yükselmesini sağlıyoruz.
    if (finalData.length === 1) {
      finalData.unshift({
        sortKey: finalData[0].sortKey - 1,
        date: "Başlangıç",
        income: 0,
        deposit: 0
      });
    }

    return finalData;
  }, [orders, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/90 backdrop-blur-md border border-border/50 p-3 rounded-2xl shadow-xl min-w-[150px]">
          <p className="text-foreground font-bold mb-2 text-sm">{label}</p>
          <div className="space-y-2">
            {payload.map((p: any, idx: number) => {
              let title = p.dataKey === "income" ? "Toplam Satış" : "Alınan Ödeme";
              return (
                <div key={idx} className="flex items-center justify-between gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: p.color }}></div>
                    {title}
                  </span>
                  <span className="font-black text-foreground tracking-tight">
                    ₺{p.value.toLocaleString("tr-TR")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowIncome(!showIncome)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all ${showIncome ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface border-border text-muted-foreground'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Toplam Satış
          </button>
          <button 
            onClick={() => setShowDeposit(!showDeposit)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all ${showDeposit ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-surface border-border text-muted-foreground'}`}
          >
            <Wallet className="w-3.5 h-3.5" /> Alınan Ödeme
          </button>
        </div>
        <div className="flex items-center bg-muted/30 rounded-lg p-1 border border-border">
          {["7D", "30D", "ALL"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as "7D" | "30D" | "ALL")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range ? "bg-surface shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"}`}
            >
              {range === "7D" ? "7 Gün" : range === "30D" ? "30 Gün" : "Tümü"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ height: 300, width: '100%', WebkitTapHighlightColor: 'transparent', outline: 'none' }} className="focus:outline-none">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border p-4 text-center">
            <Info className="w-6 h-6 mb-2 text-primary/50" />
            <p className="font-medium text-sm text-foreground">Grafik verisi bulunamadı</p>
            <p className="text-xs mt-1">Seçilen tarih aralığında henüz bir sipariş yok.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.3} />
              
              <XAxis 
                dataKey="date" 
                stroke="var(--muted-foreground)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              
              {!isMobile && (
                <YAxis 
                  yAxisId="money"
                  stroke="var(--muted-foreground)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₺${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} 
                  width={45}
                  orientation="left"
                />
              )}

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '4 4' }} wrapperStyle={{ outline: 'none' }} />
              
              {showIncome && (
                <Area 
                  yAxisId={isMobile ? undefined : "money"}
                  type="monotone" 
                  dataKey="income" 
                  stroke="var(--primary)" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  activeDot={{ r: 4, fill: "var(--primary)", stroke: "var(--surface)", strokeWidth: 2 }}
                />
              )}
              
              {showDeposit && (
                <Area 
                  yAxisId={isMobile ? undefined : "money"}
                  type="monotone" 
                  dataKey="deposit" 
                  stroke="var(--secondary)" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorDeposit)" 
                  activeDot={{ r: 4, fill: "var(--secondary)", stroke: "var(--surface)", strokeWidth: 2 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
