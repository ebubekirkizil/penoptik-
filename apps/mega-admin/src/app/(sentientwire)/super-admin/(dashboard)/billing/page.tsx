"use client";

import { useState } from "react";
import { CreditCard, TrendingUp, DollarSign, PieChart, Activity, Download, Building2, Clock, CheckCircle2, FileText, Search, Filter } from "lucide-react";

export default function BillingDashboard() {
  const [activeTab, setActiveTab] = useState("ozet");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const transactions = [
    { id: "TRX-8901", firm: "Pen Optik", type: "Abonelik (Yıllık)", amount: "10.000,00  ", vat: "2.000,00  ", total: "12.000,00  ", status: "Ödendi", date: "Bugün, 10:25" },
    { id: "TRX-8902", firm: "Vizyon Optik Ltd.", type: "E-Fatura Kontör (5000)", amount: "1.500,00  ", vat: "300,00  ", total: "1.800,00  ", status: "Bekliyor", date: "Dün, 14:10" },
    { id: "TRX-8903", firm: "Ege Sağlık A.Ş.", type: "Ekstra Şube Lisansı", amount: "3.500,00  ", vat: "700,00  ", total: "4.200,00  ", status: "Ödendi", date: "29 Haz 2026" },
    { id: "TRX-8904", firm: "Davut Kundura", type: "Abonelik (Aylık)", amount: "1.200,00  ", vat: "240,00  ", total: "1.440,00  ", status: "Ödendi", date: "28 Haz 2026" },
    { id: "TRX-8905", firm: "Moda Giyim A.Ş.", type: "Özel Modül Gelixtirme", amount: "25.000,00  ", vat: "5.000,00  ", total: "30.000,00  ", status: "Ödendi", date: "25 Haz 2026" },
    { id: "TRX-8906", firm: "XYZ Lojistik", type: "Abonelik (Yıllık)", amount: "10.000,00  ", vat: "2.000,00  ", total: "12.000,00  ", status: "Bekliyor", date: "24 Haz 2026" },
  ];

  const pendingTransactions = transactions.filter(t => t.status === "Bekliyor");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SaaS Gelir Tablosu</h1>
          </div>
          <p className="text-slate-500 text-sm">Abonelik gelirleri, bekleyen ödemeler ve finansal analizler.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold">
            <Download className="w-4 h-4" /> Excel'e Aktar
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("ozet")}
          className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "ozet" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4 inline-block mr-2" /> Özet & Grafikler
        </button>
        <button 
          onClick={() => setActiveTab("bekleyen")}
          className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "bekleyen" ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4 inline-block mr-2" /> Bekleyen Tahsilatlar
          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-full text-xs">
            {pendingTransactions.length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab("tum")}
          className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "tum" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" /> Tüm Faturalar
        </button>
      </div>

      {activeTab === "ozet" && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold rounded-lg">+12.5%</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aylık Net Gelir (Temmuz)</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">142.500 <span className="text-lg font-medium text-slate-400"> </span></p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bekleyen Tahsilatlar</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">28.400 <span className="text-lg font-medium text-slate-400"> </span></p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tahakkuk Eden KDV (Ödenecek)</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">28.500 <span className="text-lg font-medium text-slate-400"> </span></p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 border border-transparent rounded-2xl p-6 relative overflow-hidden text-white shadow-lg shadow-indigo-500/20 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center border border-white/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-indigo-100">MRR (Aylık Düzenli Gelir)</p>
                <p className="text-3xl font-black text-white mt-1">95.000 <span className="text-lg font-medium text-indigo-200"> </span></p>
              </div>
            </div>
          </div>

          {/* Charts Section (Mocked with CSS for visual) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                6 Aylık Gelir Trendi
              </h3>
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {[40, 55, 45, 70, 60, 95].map((height, i) => (
                  <div key={i} className="relative flex flex-col items-center flex-1 group">
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded font-bold">
                      {height * 1000}  
                    </div>
                    <div 
                      className="w-full max-w-[48px] bg-indigo-500/20 hover:bg-indigo-500 rounded-t-xl transition-all duration-300 relative overflow-hidden"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute bottom-0 w-full bg-indigo-600 rounded-t-xl transition-all duration-300" style={{ height: '0%', opacity: 0.5 }}></div>
                    </div>
                    <span className="text-xs text-slate-500 mt-3 font-medium">
                      {["Şub", "Mar", "Nis", "May", "Haz", "Tem"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-500" />
                Gelir Dağılımı
              </h3>
              <div className="flex flex-col items-center justify-center h-48 relative">
                <div className="w-32 h-32 rounded-full border-[12px] border-indigo-600 border-r-emerald-500 border-b-emerald-500 border-l-amber-500 relative flex items-center justify-center">
                  <div className="w-full h-full bg-white dark:bg-[#1E293B] rounded-full absolute inset-0 -m-[12px] border-[12px] border-transparent"></div>
                  <span className="relative z-10 text-xl font-black text-slate-900 dark:text-white">%100</span>
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>Abonelik
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">%60</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>Ek Modüller
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">%25</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>E-Fatura Kontör
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">%15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "bekleyen" && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-right-4 duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Tahsilat Bekleyen İxlemler
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">İxlem ID</th>
                  <th className="px-6 py-4 font-semibold">Firma</th>
                  <th className="px-6 py-4 font-semibold">Açıklama</th>
                  <th className="px-6 py-4 font-semibold">Tarih</th>
                  <th className="px-6 py-4 font-semibold">Tutar</th>
                  <th className="px-6 py-4 font-semibold">Durum</th>
                  <th className="px-6 py-4 font-semibold text-right">İxlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingTransactions.map((trx, i) => (
                  <tr 
                    key={i} 
                    onDoubleClick={() => setSelectedTransaction(trx)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    title="İxlem detaylarını görmek için çift tıklayın"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">{trx.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{trx.firm}</td>
                    <td className="px-6 py-4 text-slate-500">{trx.type}</td>
                    <td className="px-6 py-4 text-slate-500">{trx.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{trx.total}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                        Hatırlatma Gönder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "tum" && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-right-4 duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="İxlem no, firma ara..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Filter className="w-4 h-4" /> Filtrele
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">İxlem ID</th>
                  <th className="px-6 py-4 font-semibold">Firma</th>
                  <th className="px-6 py-4 font-semibold">Açıklama</th>
                  <th className="px-6 py-4 font-semibold">Tarih</th>
                  <th className="px-6 py-4 font-semibold">Net</th>
                  <th className="px-6 py-4 font-semibold">KDV</th>
                  <th className="px-6 py-4 font-semibold">Toplam</th>
                  <th className="px-6 py-4 font-semibold">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((trx, i) => (
                  <tr 
                    key={i} 
                    onDoubleClick={() => setSelectedTransaction(trx)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    title="İxlem detaylarını görmek için çift tıklayın"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">{trx.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-900 dark:text-white">{trx.firm}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{trx.type}</td>
                    <td className="px-6 py-4 text-slate-500">{trx.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{trx.amount}</td>
                    <td className="px-6 py-4 text-slate-400">{trx.vat}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{trx.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg
                        ${trx.status === 'Ödendi' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}
                      >
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  İxlem Detayı
                </h2>
                <p className="text-sm font-mono text-slate-500 mt-1">{selectedTransaction.id}</p>
              </div>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center">X</div>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Firma</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {selectedTransaction.firm}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">İxlem Tipi</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTransaction.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Durum</p>
                <span className={`px-2.5 py-1 inline-block mt-1 text-xs uppercase font-bold tracking-wider rounded-lg
                  ${selectedTransaction.status === 'Ödendi' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}
                >
                  {selectedTransaction.status}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">Net Tutar:</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedTransaction.amount}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">KDV:</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedTransaction.vat}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Toplam:</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{selectedTransaction.total}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
