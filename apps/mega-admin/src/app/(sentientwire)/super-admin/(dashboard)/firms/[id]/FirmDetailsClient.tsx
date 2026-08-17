"use client";

import React, { useState } from "react";
import { 
  Building2, Globe, Server, Activity, Users, 
  CreditCard, ShieldAlert, ArrowLeft, LogIn, TrendingUp, DollarSign, Settings,
  CheckCircle2, Key, Package, History, Loader2, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { impersonateFirm, updateFirmModules, updateFirmAdminCredentials, extendSubscription } from "./actions";

export default function FirmDetailsClient({ 
  firm, 
  totalEmployees, 
  totalDataEntries, 
  totalUsageHours, 
  activeTickets,
  transactions,
  settings,
  allModules
}: { 
  firm: any;
  totalEmployees: number;
  totalDataEntries: number;
  totalUsageHours: number;
  activeTickets: number;
  transactions: any[];
  settings?: any;
  allModules: any[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "packages" | "billing" | "theme" | "security">("overview");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/firms" className="p-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{firm.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                firm.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}>
                {firm.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{firm.sector}</span> 
              <span>•</span>
              {firm.domain ? (
                <a href={`https://${firm.domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                  <Globe className="w-3.5 h-3.5" /> {firm.domain}
                </a>
              ) : (
                <span className="flex items-center gap-1"><Server className="w-3.5 h-3.5" /> Subdomain</span>
              )}
            </p>
          </div>
        </div>

        {/* Impersonation Button */}
        <div className="flex gap-3">
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<Activity className="w-4 h-4" />} label="Genel Bakıx" />
        <TabButton active={activeTab === "packages"} onClick={() => setActiveTab("packages")} icon={<Package className="w-4 h-4" />} label="Paket & Modüller" />
        <TabButton active={activeTab === "billing"} onClick={() => setActiveTab("billing")} icon={<CreditCard className="w-4 h-4" />} label="Finans & Ödemeler" />
        <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Key className="w-4 h-4" />} label="Güvenlik & Şifre" />
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <OverviewTab firm={firm} totalEmployees={totalEmployees} totalDataEntries={totalDataEntries} totalUsageHours={totalUsageHours} activeTickets={activeTickets} settings={settings} />
        )}
        {activeTab === "packages" && (
          <PackagesTab firm={firm} allModules={allModules} />
        )}
        {activeTab === "billing" && (
          <BillingTab firm={firm} transactions={transactions} />
        )}
        {activeTab === "security" && (
          <SecurityTab firm={firm} />
        )}
      </div>

    </div>
  );
}

// ----------------------------------------------------------------------
// SUB COMPONENTS
// ----------------------------------------------------------------------

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
        active 
          ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" 
          : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-t-xl"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function OverviewTab({ firm, totalEmployees, totalDataEntries, totalUsageHours, activeTickets, settings }: any) {
  let themeData: any = {};
  if (settings?.themeData) {
    try { themeData = JSON.parse(settings.themeData); } catch(e) {}
  }
  const firmAdmin = firm.users?.find((u: any) => u.role === "FIRM_ADMIN");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Activity />} title="Toplam Veri Girixi" value={totalDataEntries} color="indigo" />
        <StatCard icon={<Users />} title="Kayıtlı Personel" value={totalEmployees} color="blue" />
        <StatCard icon={<DollarSign />} title="Tahmini Hacim" value="142.500  " color="emerald" />
        <StatCard icon={<TrendingUp />} title="Kullanım Süresi" value={`${totalUsageHours.toFixed(1)}s /ay`} color="amber" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" /> Kurulum & İletixim Bilgileri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-500">Müxteri (Hesap Sahibi)</p>
                {firmAdmin ? (
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg">{firmAdmin.firstName?.[0] || "?"}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-lg">{firmAdmin.firstName} {firmAdmin.lastName}</p>
                      <p className="text-sm font-medium text-slate-500">{firmAdmin.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white mt-1">-</p>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Kayıtlı Telefon</p>
                <p className="font-medium text-slate-900 dark:text-white mt-1">{firm.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Kurumsal E-Posta</p>
                <p className="font-medium text-slate-900 dark:text-white mt-1">{firm.email || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-bold text-slate-500">Açık Adres</p>
                <p className="font-medium text-slate-900 dark:text-white mt-1">{firm.address || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-bold text-slate-500">Google Maps Bağlantısı</p>
                {themeData?.googleMapsUrl ? (
                  <a href={themeData.googleMapsUrl} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline mt-1 block truncate">
                    {themeData.googleMapsUrl}
                  </a>
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white mt-1">-</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Firma Personelleri ve Rolleri
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 rounded-lg border border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-l-lg">Personel</th>
                    <th className="px-4 py-3 font-semibold">Rol / Yetki</th>
                    <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Aktif Saat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {firm.users?.length > 0 ? firm.users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300 font-bold">
                        {user.totalActiveHours?.toFixed(1)}s
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">Bu firmada henüz kayıtlı personel bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
              <Server className="w-4 h-4" /> Veritabanı Alanı
            </h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{(1.2 + (totalDataEntries * 0.45)).toFixed(2)} MB</span>
              <span className="text-slate-400 text-sm font-bold">/ 500 MB</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, ((1.2 + (totalDataEntries * 0.45)) / 500) * 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Destek Talepleri
            </h3>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-black text-rose-500">{activeTickets}</p>
                <p className="text-xs text-slate-400 font-bold mt-1">Açık Ticket</p>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-500">14</p>
                <p className="text-xs text-slate-400 font-bold mt-1">Çözülen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: any) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 from-indigo-500/10 to-blue-500/10",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 from-blue-500/10 to-cyan-500/10",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 from-emerald-500/10 to-teal-500/10",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 from-amber-500/10 to-orange-500/10",
  };
  const classes = colors[color] || colors.indigo;
  const gradient = classes.split(' ').slice(4).join(' ');

  return (
    <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${gradient} rounded-bl-full transition-transform group-hover:scale-110`}></div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 ${classes.split(' ').slice(0, 3).join(' ')}`}>
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}

function PackagesTab({ firm, allModules }: any) {
  let parsedModules: string[] = [];
  try {
    if (firm.activeModules) {
      parsedModules = JSON.parse(firm.activeModules);
    }
  } catch (e) {
    console.error("Failed to parse firm.activeModules", e);
  }
  const [modules, setModules] = useState<string[]>(parsedModules);
  const [saving, setSaving] = useState(false);

  const toggleModule = (id: string) => {
    setModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateFirmModules(firm.id, modules);
    setSaving(false);
    alert("Modüller baxarıyla güncellendi!");
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sistemsel Modül & Paket Yönetimi</h2>
        <p className="text-sm text-slate-500">Müxterinin kullanabileceği modülleri anında açıp kapatabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allModules?.map((mod: any) => {
          const isActive = modules.includes(mod.id);
          return (
            <div 
              key={mod.id} 
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                isActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
              }`}
              onClick={() => toggleModule(mod.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-bold ${isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"}`}>
                    {mod.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mod.description}</p>
                </div>
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  isActive ? "bg-indigo-500 text-white" : "bg-slate-200 dark:bg-slate-700"
                }`}>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Paketleri Kaydet
        </button>
      </div>
    </div>
  );
}

function BillingTab({ firm, transactions }: any) {
  const currentEnd = firm.subscriptionEnd ? new Date(firm.subscriptionEnd) : null;
  const daysLeft = currentEnd ? Math.ceil((currentEnd.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
  
  const isCritical = daysLeft > 0 && daysLeft <= 7;
  const isExpired = daysLeft <= 0;

  const [daysToAdd, setDaysToAdd] = useState(30);
  const [amount, setAmount] = useState(2500);
  const [extending, setExtending] = useState(false);

  const handleExtend = async () => {
    setExtending(true);
    await extendSubscription(firm.id, daysToAdd, amount, "Kredi Kartı / Havale");
    setExtending(false);
    alert("Abonelik baxarıyla uzatıldı!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      
      {/* Subscription Status */}
      <div className="lg:col-span-1 space-y-6">
        <div className={`rounded-3xl p-6 border-2 relative overflow-hidden ${
          isExpired ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50" :
          isCritical ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50" :
          "bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-800"
        }`}>
          {isCritical && (
            <div className="absolute top-0 right-0 w-3 h-3 m-4 rounded-full bg-red-500 animate-ping"></div>
          )}

          <h3 className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Abonelik Durumu
          </h3>
          
          <div className="my-4">
            {currentEnd ? (
              <>
                <p className={`text-4xl font-black ${isExpired ? "text-red-600" : isCritical ? "text-amber-600" : "text-emerald-600"}`}>
                  {isExpired ? "Süresi Doldu" : `${daysLeft} Gün`}
                </p>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Bitix: {currentEnd.toLocaleDateString('tr-TR')}
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-slate-500">Abonelik Baxlamadı</p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Süreyi Uzat</h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={daysToAdd} 
                  onChange={e => setDaysToAdd(parseInt(e.target.value) || 0)} 
                  className="w-1/3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none" 
                  placeholder="Gün" 
                />
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(parseInt(e.target.value) || 0)} 
                  className="w-2/3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none" 
                  placeholder="Tutar ( )" 
                />
              </div>
              <button 
                onClick={handleExtend}
                disabled={extending}
                className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {extending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Ödeme Ekle & Uzat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" /> Ödeme & İxlem Geçmixi
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 rounded-lg">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-l-lg">Tarih</th>
                  <th className="px-4 py-3 font-semibold">Açıklama</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {new Date(t.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                      {t.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-md text-slate-500">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{t.amount.toLocaleString('tr-TR')}  
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Ödeme geçmixi bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
}

function SecurityTab({ firm }: any) {
  const firmAdmin = firm.users?.find((u: any) => u.role === "FIRM_ADMIN");
  const [newEmail, setNewEmail] = useState(firmAdmin?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleReset = async () => {
    if (!newEmail.trim()) return alert("Girix e-postası box olamaz.");
    if (newPassword && newPassword.length < 6) return alert("Şifre en az 6 karakter olmalıdır.");
    setSaving(true);
    try {
      await updateFirmAdminCredentials(firm.id, newEmail, newPassword);
      setNewPassword("");
      alert("Kullanıcı bilgileri baxarıyla güncellendi!");
    } catch (e: any) {
      alert(e.message || "Hata oluxtu.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in duration-300 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Şifre & Güvenlik Yönetimi</h2>
        <p className="text-sm text-slate-500">Müxterinin (Firma Yöneticisinin) girix bilgilerini ve xifresini değixtirebilirsiniz.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex gap-3 mb-6">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-400">
          Bu ixlem, firmanın kuruluxtaki ilk <strong>FIRM_ADMIN</strong> kullanıcısının girix bilgilerini (Email veya Şifre) değixtirecektir. 
          Eski xifre veya email ile girix yapılamayacaktır.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kullanıcı Adı (Girix E-postası)</label>
          <input 
            type="email" 
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="ornek@firma.com"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Yeni Şifre (Değixtirmek istemiyorsanız box bırakın)</label>
          <input 
            type="text" 
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="En az 6 karakter..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button 
          onClick={handleReset} 
          disabled={saving || !newEmail}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 w-full sm:w-auto mt-4"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
          Bilgileri Güncelle
        </button>
      </div>
    </div>
  );
}
