import { Bot } from "lucide-react";
import { prisma } from "@/lib/db";
import AiAnalyticsClient from "./AiAnalyticsClient";

export default async function AiAnalyticsPage() {
  const rawLogs = await prisma.aiUsageLog.findMany({
    select: {
      id: true,
      firm: { select: { name: true } },
      query: true,
      responseSummary: true,
      source: true,
      modelUsed: true,
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 500,
  });

  const logs = rawLogs.map(log => ({
    ...log,
    promptTokens: log.promptTokens || 0,
    completionTokens: log.completionTokens || 0,
    totalTokens: log.totalTokens || 0,
    cost: 0,
    isError: false,
    errorMessage: null,
  }));

  // Aggregation
  let totalTokens = 0;
  let totalCost = 0;
  let totalErrors = 0;
  const modelUsage: Record<string, number> = {};
  const firmUsage: Record<string, number> = {};
  const timeline: Record<string, { date: string; tokens: number; cost: number }> = {};

  for (const log of logs) {
    totalTokens += log.totalTokens;
    totalCost += log.cost;
    if (log.isError) totalErrors++;
    
    // Model usage
    const modelName = log.modelUsed || log.source;
    if (!modelUsage[modelName]) modelUsage[modelName] = 0;
    modelUsage[modelName] += 1;

    // Firm usage
    const firmName = log.firm?.name || "Bilinmiyor";
    if (!firmUsage[firmName]) firmUsage[firmName] = 0;
    firmUsage[firmName] += log.totalTokens;

    // Timeline (Daily)
    const date = new Date(log.createdAt).toISOString().split("T")[0];
    if (!timeline[date]) timeline[date] = { date, tokens: 0, cost: 0 };
    timeline[date].tokens += log.totalTokens;
    timeline[date].cost += log.cost;
  }

  const modelUsageData = Object.entries(modelUsage).map(([name, value]) => ({ name, value }));
  const firmUsageData = Object.entries(firmUsage).map(([name, value]) => ({ name, value }));
  const timelineData = Object.values(timeline).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
          <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Yapay Zeka Analizleri</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Firmaların akıllı danıxman kullanım metrikleri ve sohbet logları.</p>
        </div>
      </div>

      <AiAnalyticsClient 
        logs={logs}
        totalTokens={totalTokens}
        totalCost={totalCost}
        totalQueries={logs.length}
        totalErrors={totalErrors}
        modelUsageData={modelUsageData}
        firmUsageData={firmUsageData}
        timelineData={timelineData}
      />
    </div>
  );
}
