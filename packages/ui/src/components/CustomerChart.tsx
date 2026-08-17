"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Users, Info } from "lucide-react";

type Customer = {
  id: string;
  createdAt: string;
};

const WEEK_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export default function CustomerChart({ customers = [] }: { customers: Customer[] }) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "ALL">("30D");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const savedTime = localStorage.getItem("optisyen_custchart_timeRange");
    if (savedTime === "7D" || savedTime === "30D" || savedTime === "ALL") setTimeRange(savedTime);
  }, []);

  useEffect(() => {
    localStorage.setItem("optisyen_custchart_timeRange", timeRange);
  }, [timeRange]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const data = useMemo(() => {
    const now = new Date();
    const sortedCustomers = [...customers].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const dailyData: Record<string, { sortKey: number, date: string, cumulative: number }> = {};
    let currentTotal = 0;
    const aggregatedByDay: Record<string, { sortKey: number, date: string, newCount: number }> = {};
    
    sortedCustomers.forEach(c => {
      const d = new Date(c.createdAt);
      const groupKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      
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

      if (!aggregatedByDay[groupKey]) {
        aggregatedByDay[groupKey] = { sortKey, date: label, newCount: 0 };
      }
      aggregatedByDay[groupKey].newCount += 1;
    });

    const sortedDays = Object.keys(aggregatedByDay).sort((a, b) => a.localeCompare(b));
    
    sortedDays.forEach(day => {
      currentTotal += aggregatedByDay[day].newCount;
      const item = aggregatedByDay[day];
      
      let finalKey = day;
      if (timeRange === "ALL") {
        const d = new Date(day);
        finalKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      }
      
      if (!dailyData[finalKey]) {
        dailyData[finalKey] = { sortKey: item.sortKey, date: item.date, cumulative: currentTotal };
      } else {
        dailyData[finalKey].cumulative = currentTotal;
      }
    });

    const fullData = Object.values(dailyData).sort((a, b) => a.sortKey - b.sortKey);

    let filteredData;
    if (timeRange === "7D") {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 7);
      filteredData = fullData.filter(d => d.sortKey >= past7.getTime());
    } else if (timeRange === "30D") {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 30);
      filteredData = fullData.filter(d => d.sortKey >= past30.getTime());
    } else {
      filteredData = fullData;
    }
    
    let result = filteredData;
    
    // Add realistic mock data if empty (for demo purposes)
    if (result.length === 0) {
      const mockResult = [];
      const daysToGenerate = timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : 12;
      const step = timeRange === "ALL" ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      
      let baseCumulative = 10;

      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * step);
        let label = "";
        
        if (timeRange === "7D") label = WEEK_DAYS[d.getDay()];
        else if (timeRange === "30D") label = d.toLocaleDateString("tr-TR", { month: "short", day: "numeric" });
        else label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        
        // Add random customers 1 to 4 per period
        baseCumulative += Math.floor(Math.random() * 4) + 1;

        mockResult.push({
          sortKey: d.getTime(),
          date: label,
          cumulative: baseCumulative,
          isMock: true
        });
      }
      result = mockResult;
    }

    return result;
  }, [customers, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-lg">
          <p className="text-foreground font-semibold mb-2">{label}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              Kayıtlı Müşteri
            </span>
            <span className="font-bold text-foreground">
              {payload[0].value}
            </span>
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
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-primary/10 border-primary/30 text-primary text-xs font-semibold">
          <Users className="w-3.5 h-3.5" /> Kayıtlı Müşteri
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
      <div style={{ height: 300, width: '100%' }} className="relative">
        {data[0]?.isMock && (
          <div className="absolute top-0 right-0 z-10 px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-md flex items-center gap-1">
            <Info className="w-3 h-3" /> Demo Verisi
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
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
                  stroke="var(--muted-foreground)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                  width={40}
                  orientation="left"
                />
              )}

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="var(--primary)" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorCust)" 
                animationDuration={1000}
                activeDot={{ r: 4, fill: "var(--primary)", stroke: "var(--surface)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
