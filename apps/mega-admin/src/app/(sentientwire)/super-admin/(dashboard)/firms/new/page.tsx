import { prisma } from "@/lib/prisma";
import { Building2, Save, ArrowLeft, Globe, UserPlus, CreditCard } from "lucide-react";
import Link from "next/link";
import { NewFirmForm } from "./NewFirmForm";

export const dynamic = "force-dynamic";

export default async function NewFirmPage() {
  const packages = await prisma.subscriptionPackage.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/firms" className="p-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Yeni Kurumsal Müxteri Ekle</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sisteme yeni bir müxteri (tenant) tanımlayın ve altyapısını anında kurun.</p>
        </div>
      </div>

      <NewFirmForm packages={packages} />
    </div>
  );
}
