"use client";

import { useState } from "react";
import { Clock, User as UserIcon, Activity, Eye, X, ShieldAlert, MonitorSmartphone, CalendarDays, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function LogTable({ logs }: { logs: any[] }) {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const renderDetails = (details: any) => {
    if (!details) return <p className="text-sm text-muted-foreground italic">Detay verisi yok.</p>;

    if (details.old && details.new) {
      const keys = Array.from(new Set([...Object.keys(details.old || {}), ...Object.keys(details.new || {})]));
      return (
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-slate-50 dark:bg-surface-light rounded-lg text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div>Alan</div>
            <div>Eski Değer</div>
            <div>Yeni Değer</div>
          </div>
          {keys.map((key) => {
            const oldVal = details.old ? details.old[key] : null;
            const newVal = details.new ? details.new[key] : null;
            if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null;
            return (
              <div key={key} className="grid grid-cols-3 gap-2 px-3 py-2 text-sm border-b border-border-color/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-surface-light/30 transition-colors rounded-lg">
                <div className="font-medium text-foreground truncate flex items-center gap-1.5" title={key}>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                  {key}
                </div>
                <div className="text-red-500 line-through truncate opacity-80" title={String(oldVal)}>{oldVal !== null && oldVal !== undefined ? String(oldVal) : "-"}</div>
                <div className="text-emerald-500 font-medium truncate" title={String(newVal)}>{newVal !== null && newVal !== undefined ? String(newVal) : "-"}</div>
              </div>
            );
          })}
        </div>
      );
    }

    const formatValue = (key: string, val: any) => {
      if (val === null || val === undefined) return "-";
      if (key.toLowerCase().includes("amount") || key.toLowerCase().includes("price") || key.toLowerCase().includes("deposit") || key.toLowerCase().includes("balance")) {
        return `${Number(val).toLocaleString("tr-TR")} ₺`;
      }
      if (key.toLowerCase().includes("date") || key === "paidAt") {
        try {
          return new Date(val).toLocaleDateString("tr-TR");
        } catch {
          return String(val);
        }
      }
      return String(val);
    };

    const keyLabels: Record<string, string> = {
      amount: "Tutar",
      dueDate: "Vade Tarihi",
      paidAt: "Ödeme Tarihi",
      orderId: "Sipariş ID",
      installmentId: "Taksit ID",
      totalPrice: "Toplam Fiyat",
      deposit: "Alınan Peşinat",
      balance: "Kalan Bakiye",
      status: "Durum",
      products: "Ürünler"
    };

    return (
      <div className="space-y-1.5 mt-4 bg-slate-50/50 dark:bg-surface-light/30 p-4 rounded-xl border border-border-color">
        {Object.entries(details).map(([key, val]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm py-1.5 border-b border-border-color/50 last:border-0">
            <div className="font-medium text-muted-foreground mb-1 sm:mb-0 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
              {keyLabels[key] || key}
            </div>
            <div className="font-semibold text-foreground break-all sm:text-right">{formatValue(key, val)}</div>
          </div>
        ))}
      </div>
    );
  };

  const getUserCodeBadge = (user: any) => {
    if (!user) return null;
    const isOwner = user.role === "FIRM_ADMIN" || user.role === "OWNER";
    const code = user.userCode || "----";
    
    if (isOwner) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ml-2">
          <ShieldAlert className="w-3 h-3" />
          {`01ADMIN-#${code}`}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ml-2">
        #{code}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-surface shadow-sm rounded-2xl border border-border-color overflow-hidden">
        {/* Mobile View (Cards) */}
        <div className="block lg:hidden divide-y divide-border-color">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Hiç işlem bulunamadı.</div>
          ) : (
            logs.map(log => (
              <div 
                key={log.id} 
                className="p-4 hover:bg-slate-50/50 dark:hover:bg-surface-light/50 transition-colors active:bg-slate-100 dark:active:bg-surface-light cursor-pointer select-none"
                onClick={() => setSelectedLog(log)}
                onDoubleClick={() => setSelectedLog(log)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-sm text-foreground line-clamp-2 leading-tight">{log.action}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 bg-slate-50 dark:bg-surface-light p-3 rounded-xl border border-border-color">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <UserIcon className="w-3.5 h-3.5" />
                      {log.user?.firstName || "Bilinmiyor"} {log.user?.lastName || ""}
                    </div>
                    {getUserCodeBadge(log.user)}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border-color/50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: tr })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-center text-[10px] font-semibold text-primary/60 uppercase tracking-widest bg-primary/5 py-1.5 rounded-lg border border-primary/10">
                  Detayları Görmek İçin Dokun
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-surface-light text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Zaman</th>
                <th className="px-6 py-4">Kullanıcı (Personel)</th>
                <th className="px-6 py-4 w-full">İşlem Özeti</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <MonitorSmartphone className="w-8 h-8 opacity-20 mb-2" />
                      Hiç işlem bulunamadı.
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-surface-light/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: tr })}
                        </div>
                        <span className="text-[10px] text-muted-foreground ml-5 font-mono" title={new Date(log.createdAt).toLocaleString("tr-TR")}>
                          {new Date(log.createdAt).toLocaleString("tr-TR")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center font-bold text-foreground text-sm">
                          {log.user?.firstName || "Bilinmiyor"} {log.user?.lastName || ""}
                          {getUserCodeBadge(log.user)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          {log.user?.role || "BİLİNMİYOR"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-foreground whitespace-normal line-clamp-2">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.details ? (
                        <button 
                          className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-1.5 ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Detayları İncele"
                        >
                          <Eye className="w-3.5 h-3.5" /> İncele
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mr-2">Yok</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedLog(null)}>
          <div 
            className="bg-white dark:bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col  border border-border-color"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border-color bg-slate-50/50 dark:bg-surface-light/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-foreground tracking-tight">İşlem Detayları</h3>
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {new Date(selectedLog.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-surface-light p-4 rounded-xl border border-border-color">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> Aksiyon Özeti
                  </p>
                  <p className="text-sm font-semibold text-foreground leading-snug">{selectedLog.action}</p>
                </div>
                <div className="bg-slate-50 dark:bg-surface-light p-4 rounded-xl border border-border-color">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <UserIcon className="w-3 h-3" /> İşlemi Yapan
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {selectedLog.user?.firstName || "Bilinmiyor"} {selectedLog.user?.lastName || ""}
                    </p>
                    {getUserCodeBadge(selectedLog.user)}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">Kayıtlı Veriler (Sistem Logu)</h4>
                </div>
                {renderDetails(selectedLog.details)}
              </div>
            </div>
            
            <div className="p-4 border-t border-border-color bg-slate-50 dark:bg-surface-light flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
