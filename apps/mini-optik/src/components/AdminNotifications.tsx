"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, PackageX, CreditCard, ShieldCheck, Activity, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type NotificationItem = {
  id: string;
  type: "CRITICAL_STOCK" | "OUT_OF_STOCK" | "OVERDUE_PAYMENT" | "PENDING_VERIFICATION" | "SYSTEM_LOG";
  title: string;
  description: string;
  link: string;
  date?: Date;
  isRead: boolean;
};

export default function AdminNotifications({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "CRITICAL_STOCK": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "OUT_OF_STOCK": return <PackageX className="w-5 h-5 text-rose-500" />;
      case "OVERDUE_PAYMENT": return <CreditCard className="w-5 h-5 text-rose-500" />;
      case "PENDING_VERIFICATION": return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case "SYSTEM_LOG": return <Activity className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
      >
        <Bell className={`w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors ${unreadCount > 0 ? "animate-pulse" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#1E293B]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              Bildirim Merkezi
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {unreadCount} Yeni
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">Yeni bildiriminiz bulunmuyor.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      setIsOpen(false);
                      router.push(notif.link);
                    }}
                    className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors relative ${!notif.isRead ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                  >
                    {!notif.isRead && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-white dark:bg-[#1E293B] shadow-sm ${
                      notif.type === 'CRITICAL_STOCK' ? 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-500/10' :
                      notif.type === 'OUT_OF_STOCK' || notif.type === 'OVERDUE_PAYMENT' ? 'border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-500/10' :
                      notif.type === 'PENDING_VERIFICATION' ? 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-500/10' :
                      'border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-500/10'
                    }`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 pr-6">
                      <p className={`text-sm font-bold ${!notif.isRead ? 'text-foreground' : 'text-slate-700 dark:text-slate-300'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {notif.description}
                      </p>
                      {notif.date && (
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                          {new Date(notif.date).toLocaleDateString('tr-TR')} {new Date(notif.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <button onClick={() => setIsOpen(false)} className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
