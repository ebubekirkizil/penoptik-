// @ts-nocheck
import { prisma } from "@/lib/mock-prisma";
import FinanceClient from "./FinanceClient";

export default async function FinancePage({ searchParams }: { searchParams: any }) {
  const records = await prisma.financeRecord.findMany();
  const params = await searchParams;
  const activeTab = params?.tab || "OVERVIEW";
  
  return <FinanceClient initialRecords={records} initialTab={activeTab} />;
}
