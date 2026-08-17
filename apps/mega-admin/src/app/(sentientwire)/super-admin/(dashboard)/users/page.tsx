"use client";

import { useState } from "react";
import { Users, Shield, UserPlus, MoreVertical, Key, X, CheckCircle2, Clock } from "lucide-react";

export default function SuperAdminsPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const admins = [
    { id: 1, name: "Beytullah Kızıl", role: "Kurucu / Mega Admin", email: "ceo@sentientwire.com", lastLogin: "Şu an aktif", status: "Aktif" },
    { id: 2, name: "Sistem Destek Asistanı", role: "AI Otomasyon", email: "bot@sentientwire.com", lastLogin: "Sürekli aktif", status: "Aktif" },
    { id: 3, name: "Ahmet Yılmaz", role: "Finans Yöneticisi", email: "finans@sentientwire.com", lastLogin: "Dün, 15:30", status: "Aktif" },
    { id: 4, name: "Mehmet Demir", role: "Teknik Destek", email: "destek@sentientwire.com", lastLogin: "1 Saat Önce", status: "Aktif" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Süper Yöneticiler</h1>
          </div>
          <p className="text-slate-500 text-sm">Sentient Wire sistemine tam eriximi olan personelleri yönetin.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
          <UserPlus className="w-4 h-4" /> Yeni Yönetici Ekle
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Yönetici Adı</th>
                <th className="px-6 py-4 font-semibold">Sistem Rolü</th>
                <th className="px-6 py-4 font-semibold">Son Girix</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold text-right">İxlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {admins.map((admin, i) => (
                <tr 
                  key={i} 
                  onDoubleClick={() => setSelectedUser(admin)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  title="Yönetici detaylarını görmek için çift tıklayın"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{admin.name}</p>
                    <p className="text-xs text-slate-500">{admin.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      {admin.role === "Kurucu / Mega Admin" && <Shield className="w-4 h-4 text-indigo-500" />}
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{admin.lastLogin}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10" title="Şifre Sıfırla">
                        <Key className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedUser.name}
                  {selectedUser.role === "Kurucu / Mega Admin" && <Shield className="w-5 h-5 text-indigo-500" />}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{selectedUser.role}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">E-Posta Adresi</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Son Girix</p>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {selectedUser.lastLogin}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Hesap Durumu</p>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs uppercase font-bold tracking-wider rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Kapat
              </button>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
                Profili Düzenle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
