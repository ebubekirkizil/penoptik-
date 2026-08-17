// @ts-nocheck
"use client";

import React from 'react';
import { Calendar, AlertCircle, Clock } from 'lucide-react';

export default function TaxCalendar() {
  const taxEvents = [
    { date: "Her Ayın 28'i", title: "KDV Beyannamesi ve Ödemesi", desc: "Bir önceki ayın KDV'si", type: "monthly", priority: "high" },
    { date: "Her Ayın 26'sı", title: "Muhtasar ve Prim Hizmet", desc: "Stopaj ve SGK bildirimleri", type: "monthly", priority: "high" },
    { date: "17 Şub, May, Ağu, Kas", title: "Geçici Vergi", desc: "3 Aylık Kazanç Beyanı", type: "quarterly", priority: "medium" },
    { date: "Mart Ayı", title: "Yıllık Gelir Vergisi", desc: "Şahıs Şirketleri İçin", type: "annual", priority: "medium" },
    { date: "Nisan Ayı", title: "Kurumlar Vergisi", desc: "Sermaye Şirketleri İçin (Ltd, A.Ş.)", type: "annual", priority: "medium" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Türkiye Vergi Takvimi</h2>
          <p className="text-xs text-muted-foreground">Önemli beyanname ve ödeme tarihleri</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {taxEvents.map((event, idx) => (
          <div key={idx} className="flex gap-4 p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors border border-border/50">
            <div className="flex flex-col items-center justify-center shrink-0 w-16 text-center">
              <span className="text-xs font-medium text-muted-foreground mb-1">{event.type === 'monthly' ? 'Aylık' : event.type === 'quarterly' ? '3 Aylık' : 'Yıllık'}</span>
              <span className="text-sm font-bold text-primary leading-tight">{event.date}</span>
            </div>
            
            <div className="w-px bg-border/50 my-1" />
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm text-foreground">{event.title}</h3>
                {event.priority === 'high' && (
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Tatil günlerine denk gelen ödemeler takip eden ilk iş gününe sarkar.
        </p>
      </div>
    </div>
  );
}
