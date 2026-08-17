import { Server, Activity } from "lucide-react";
import os from "os";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ServerMonitorPage() {
  const cpus = os.cpus();
  const memoryTotal = os.totalmem() / (1024 ** 3);
  const memoryFree = os.freemem() / (1024 ** 3);
  const memoryUsed = memoryTotal - memoryFree;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
          <Server className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sunucu & Veritabanı Monitörü</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Sistem performans ve donanım kullanım verileri.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2"><Activity className="w-4 h-4"/> CPU Bilgisi</h3>
          <p className="text-slate-900 dark:text-white font-medium">{cpus[0]?.model || "Bilinmiyor"}</p>
          <p className="text-slate-500 text-sm mt-1">{cpus.length} Çekirdek</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2"><Server className="w-4 h-4"/> RAM Bilgisi</h3>
          <p className="text-slate-900 dark:text-white font-medium">Kullanılan: {memoryUsed.toFixed(2)} GB / Toplam: {memoryTotal.toFixed(2)} GB</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${(memoryUsed / memoryTotal) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
