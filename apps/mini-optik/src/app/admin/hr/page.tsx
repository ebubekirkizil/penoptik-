import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Users, Briefcase, Plus, TrendingUp } from "lucide-react";

export default async function HRPage() {
  const session = await getSession();
  const firmId = session?.firmId;

  if (!firmId) return null;

  const employees = await prisma.user.findMany({
    where: { firmId, role: { in: ["FIRM_EMPLOYEE", "FIRM_ADMIN"] } },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" /> Personel Takibi (HR)
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Mağazanızda çalışan personelin vardiyalarını, mesailerini ve maaş/prim ödemelerini buradan yönetebilirsiniz.
          </p>
        </div>
        <Link href="/admin/settings?tab=users" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Yeni Personel Ekle
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-surface/50 border border-border-color rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{emp.firstName} {emp.lastName}</h3>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
                  <Briefcase className="w-3.5 h-3.5" /> {emp.position || (emp.role === "FIRM_ADMIN" ? "Yönetici" : "Personel")}
                </p>
              </div>
              <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider ${emp.role === 'FIRM_ADMIN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                {emp.role === 'FIRM_ADMIN' ? 'Admin' : 'Çalışan'}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Taban Maaş:</span>
                <span className="font-bold text-foreground">
                  {emp.salary ? `${emp.salary.toLocaleString("tr-TR")} ₺` : "Belirlenmedi"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">SGK Kesinti Oranı:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">%{emp.sgkTaxRate}</span>
              </div>
            </div>

            <Link href={`/admin/hr/${emp.id}`} className="w-full flex justify-center items-center gap-2 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 rounded-xl text-sm font-bold transition-colors">
              <TrendingUp className="w-4 h-4" /> Detaylar ve Bordro
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
