"use client";

import { useState } from "react";
import { CheckCircle, Clock, X, User, Activity } from "lucide-react";

const STATUS_CONFIG = {
  PENDING:   { label: "Bekliyor", color: "text-amber-700 dark:text-amber-200", bg: "bg-amber-500/20" },
  PREPARING: { label: "Hazırlanıyor", color: "text-blue-700 dark:text-blue-200", bg: "bg-blue-500/20" },
  READY:     { label: "Teslime Hazır", color: "text-emerald-700 dark:text-emerald-200", bg: "bg-emerald-500/20" },
  DELIVERED: { label: "Teslim Edildi", color: "text-muted-foreground", bg: "bg-surface/50" },
  COMPLETED: { label: "Tamamlandı", color: "text-primary", bg: "bg-primary/10" },
};

export default function CustomerTransactionsList({ transactions }: { transactions: any[] }) {
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const renderBadge = (tx: any) => {
    if (tx.type === "INSTALLMENT") {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
          <CheckCircle className="w-3.5 h-3.5" /> Ödendi
        </span>
      );
    }
    if (tx.type === "LOG" && tx.status === "CANCELLED") {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-500">
          <X className="w-3.5 h-3.5" /> İptal
        </span>
      );
    }
    const cfg = STATUS_CONFIG[tx.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${cfg.color} ${cfg.bg}`}>
        {cfg.label}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-surface shadow-sm rounded-2xl mb-5">
        <div className="px-6 py-4 flex items-center justify-between border-b border-border-color">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-foreground font-semibold">Son İşlemler</h2>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium bg-slate-100 dark:bg-surface-light px-2 py-1 rounded-md hidden md:block">
            Detayları görmek için çift tıklayın
          </span>
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:block p-0 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap select-none">
            <thead className="bg-slate-50 dark:bg-surface-light text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 font-medium">Tarih</th>
                <th className="px-6 py-4 font-medium">İşlem / Ürün</th>
                <th className="px-6 py-4 font-medium">Tutar</th>
                <th className="px-6 py-4 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">İşlem bulunamadı.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr 
                    key={tx.id} 
                    onDoubleClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50/50 dark:hover:bg-surface-light/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-muted-foreground">{new Date(tx.date).toLocaleString("tr-TR")}</td>
                    <td className="px-6 py-4 text-foreground font-medium">{tx.title}</td>
                    <td className="px-6 py-4 text-foreground font-bold">{tx.amount ? `${tx.amount.toLocaleString("tr-TR")} ₺` : "-"}</td>
                    <td className="px-6 py-4">{renderBadge(tx)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col p-4 gap-3">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">İşlem bulunamadı.</p>
          ) : (
            transactions.map(tx => (
              <div 
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="bg-slate-50 dark:bg-surface-light p-4 rounded-xl border border-border-color active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="font-semibold text-sm text-foreground whitespace-normal">{tx.title}</span>
                  <div className="flex-shrink-0">{renderBadge(tx)}</div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{new Date(tx.date).toLocaleString("tr-TR")}</span>
                  <span className="font-bold text-foreground">{tx.amount ? `${tx.amount.toLocaleString("tr-TR")} ₺` : "-"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedTx(null)}>
          <div 
            className="bg-white dark:bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-border-color"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border-color bg-slate-50/50 dark:bg-surface-light/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-foreground tracking-tight">İşlem Detayları</h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 dark:bg-surface-light rounded-xl p-4 border border-border-color space-y-3">
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <span className="text-sm text-muted-foreground">İşlem Türü</span>
                  <span className="font-semibold text-sm">{selectedTx.type === "ORDER" ? "Sipariş" : selectedTx.type === "INSTALLMENT" ? "Taksit Ödemesi" : "İşlem / İptal"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <span className="text-sm text-muted-foreground">Başlık</span>
                  <span className="font-medium text-sm text-right max-w-[200px] truncate">{selectedTx.title}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <span className="text-sm text-muted-foreground">Tutar</span>
                  <span className="font-bold text-sm">{selectedTx.amount ? `${selectedTx.amount.toLocaleString("tr-TR")} ₺` : "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <span className="text-sm text-muted-foreground">Tarih</span>
                  <span className="font-medium text-sm">{new Date(selectedTx.date).toLocaleString("tr-TR")}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-sm text-muted-foreground">İşlemi Yapan</span>
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-semibold text-xs tracking-wide">
                      {selectedTx.userCode ? (selectedTx.userCode === "01ADMIN" ? selectedTx.userCode : `#${selectedTx.userCode}`) : ""} {selectedTx.createdBy}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full bg-slate-100 dark:bg-surface-light text-foreground py-3 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-border-color transition-colors"
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
