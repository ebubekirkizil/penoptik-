"use client";

import { useState } from "react";
import { Search, Download, UserPlus } from "lucide-react";

type CustomerItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ltv: number;
  frequency: number;
  lastPurchase: string;
  segment: string;
};

export default function CrmClient({ initialCustomers }: { initialCustomers: CustomerItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");

  const filteredCustomers = initialCustomers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = segmentFilter === "all" || c.segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  // Calculate summary metrics
  const totalLTV = filteredCustomers.reduce((sum, c) => sum + c.ltv, 0);
  const avgLTV = filteredCustomers.length > 0 ? totalLTV / filteredCustomers.length : 0;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Görüntülenen Müxteri</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{filteredCustomers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Hacim (LTV)</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalLTV)}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ortalama Müxteri Değeri</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(avgLTV)}
          </p>
        </div>
      </div>

      {/* CRM Interface */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="İsim, telefon veya e-posta ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
            >
              <option value="all">Tüm Segmentler</option>
              <option value="VIP (Sadık)">VIP (Sadık)</option>
              <option value="Düzenli">Düzenli</option>
              <option value="Yeni Müxteri">Yeni Müxteri</option>
              <option value="Potansiyel">Potansiyel</option>
            </select>
            
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 w-full md:w-auto hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Dıxa Aktar</span>
            </button>

            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-amber-500/20 w-full md:w-auto cursor-pointer">
              <UserPlus className="w-4 h-4" />
              <span>Müxteri Ekle</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Müxteri</th>
                <th className="px-6 py-4 font-semibold">İletixim</th>
                <th className="px-6 py-4 font-semibold">Toplam Harcama (LTV)</th>
                <th className="px-6 py-4 font-semibold">Siparix Sayısı</th>
                <th className="px-6 py-4 font-semibold">Son Alıxverix</th>
                <th className="px-6 py-4 font-semibold">Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((item, i) => (
                  <tr key={item.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{item.name}</td>
                    <td className="px-6 py-4 text-slate-500">
                      <div>{item.phone}</div>
                      <div className="text-xs opacity-70">{item.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.ltv)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.frequency}</td>
                    <td className="px-6 py-4 text-slate-500">{item.lastPurchase}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg ${
                        item.segment === "VIP (Sadık)" 
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" 
                          : item.segment === "Düzenli" 
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                            : item.segment === "Potansiyel"
                              ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      }`}>
                        {item.segment}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Arama kriterlerine uygun müxteri bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
