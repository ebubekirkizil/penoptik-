"use client";

import React, { useState } from "react";
import { AlertCircle, RefreshCw, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const MOCK_QUEUE = [
  { id: 1, type: "VERME_BILDIRIMI", barkod: "01869...21ABC1", tcNo: "12345678901", status: "FAILED", errorMessage: "ÜTS Servisi yanıt vermiyor. (HTTP 503)", date: "10 dk önce" },
  { id: 2, type: "ALMA_BILDIRIMI", barkod: "01869...21XYZ9", sender: "Ege Optik", status: "FAILED", errorMessage: "Token geçersiz veya süresi dolmuş.", date: "1 saat önce" },
  { id: 3, type: "ZAYIAT_BILDIRIMI", barkod: "01869...21QWE2", tcNo: "-", status: "PENDING", errorMessage: null, date: "Şimdi" }
];

export default function UtsQueue() {
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryAll = () => {
    setIsRetrying(true);
    toast.loading("Kuyruktaki işlemler deneniyor...", { id: "retry" });
    
    setTimeout(() => {
      setQueue(queue.map(q => ({ ...q, status: "SUCCESS" })));
      toast.success("Tüm bildirimler başarıyla ÜTS'ye iletildi!", { id: "retry" });
      setIsRetrying(false);
    }, 2000);
  };

  const handleRetrySingle = (id: number) => {
    toast.loading("İşlem deneniyor...", { id: `retry-${id}` });
    setTimeout(() => {
      setQueue(queue.map(q => q.id === id ? { ...q, status: "SUCCESS" } : q));
      toast.success("Bildirim başarılı!", { id: `retry-${id}` });
    }, 1000);
  };

  const failedCount = queue.filter(q => q.status === "FAILED").length;
  const pendingCount = queue.filter(q => q.status === "PENDING").length;

  if (queue.every(q => q.status === "SUCCESS")) {
    return (
      <div className="bg-surface border border-border-color rounded-3xl p-6 mt-8 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
        <h3 className="font-bold text-lg">Kuyruk Temiz</h3>
        <p className="text-sm text-muted-foreground mt-1">Tüm bildirimler ÜTS'ye başarıyla iletildi.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-color rounded-3xl p-6 mt-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-500" />
            Bekleyen Bildirim Kuyruğu
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            ÜTS sunucularındaki yoğunluk veya hata sebebiyle iletilemeyen işlemler burada birikir.
          </p>
        </div>
        <button 
          onClick={handleRetryAll}
          disabled={isRetrying || (failedCount === 0 && pendingCount === 0)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        >
          {isRetrying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
          Tümünü Tekrar Dene
        </button>
      </div>

      <div className="space-y-3">
        {queue.filter(q => q.status !== "SUCCESS").map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-lg ${item.status === 'FAILED' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                {item.status === 'FAILED' ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {item.barkod}
                  </span>
                </div>
                {item.status === 'FAILED' && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">{item.errorMessage}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground font-medium">
                  <span>Zaman: {item.date}</span>
                  {item.tcNo !== '-' && <span>T.C.: {item.tcNo}</span>}
                  {item.sender && <span>Gönderen: {item.sender}</span>}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleRetrySingle(item.id)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
            >
              Tekrar Dene
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
