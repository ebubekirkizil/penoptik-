"use client";

import { useState } from "react";
import { Box, RefreshCw, AlertTriangle, ArrowRightLeft, Plus, Search, Building2, Store, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  sku: string;
  name: string;
  image: string;
  totalStock: number;
  warehouses: {
    main: number;
    kadikoy: number;
    besiktas: number;
  };
  syncStatus: "Senkronize" | "Bekliyor" | "Hata";
  platforms: string[];
}

export default function InventoryClient() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      sku: "OPT-GLS-001",
      name: "Ray-Ban Aviator Klasik Günex Gözlüğü",
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop",
      totalStock: 145,
      warehouses: { main: 100, kadikoy: 25, besiktas: 20 },
      syncStatus: "Senkronize",
      platforms: ["Trendyol", "Shopify", "Hepsiburada"]
    },
    {
      id: "2",
      sku: "OPT-GLS-002",
      name: "Oakley Holbrook Polarize",
      image: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=200&h=200&fit=crop",
      totalStock: 12,
      warehouses: { main: 0, kadikoy: 10, besiktas: 2 },
      syncStatus: "Bekliyor",
      platforms: ["Shopify", "B2B"]
    },
    {
      id: "3",
      sku: "OPT-GLS-003",
      name: "Prada Symbole Kadın Günex Gözlüğü",
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop",
      totalStock: 3,
      warehouses: { main: 3, kadikoy: 0, besiktas: 0 },
      syncStatus: "Hata",
      platforms: ["Trendyol"]
    }
  ]);

  const [syncing, setSyncing] = useState(false);

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setProducts(products.map(p => ({ ...p, syncStatus: "Senkronize" })));
      setSyncing(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/super-admin/features" className="hover:text-indigo-600 transition-colors">Modüller</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-300 font-medium">Stok & Envanter</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Box className="w-8 h-8 text-indigo-500" />
            Çoklu Depo Stok Yönetimi
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Merkez deponuzu ve xubelerinizi tek ekrandan yönetin. Satıx oldukça stoklar tüm pazaryerlerinde otomatik güncellenir.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Depolar Arası Transfer
          </button>
          <button 
            onClick={handleSyncAll}
            disabled={syncing}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-70"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Pazaryerlerine Aktarılıyor...' : 'Tüm Kanalları Exitle'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">3</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Aktif Depo / Mağaza</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">12,450</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Ürün Adedi</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">24</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kritik Stok Uyarıları</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">%99.8</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pazaryeri Exitleme Oranı</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="SKU veya Ürün Adı Ara..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Ürün / SKU</th>
                <th className="px-6 py-4 font-semibold">Toplam Stok</th>
                <th className="px-6 py-4 font-semibold text-center border-l border-slate-200 dark:border-slate-700">Merkez Depo</th>
                <th className="px-6 py-4 font-semibold text-center">Kadıköy Mağaza</th>
                <th className="px-6 py-4 font-semibold text-center border-r border-slate-200 dark:border-slate-700">Bexiktax Mağaza</th>
                <th className="px-6 py-4 font-semibold">Satıx Kanalları</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md font-bold ${
                      product.totalStock > 10 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}>
                      {product.totalStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-800 font-medium">
                    {product.warehouses.main}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {product.warehouses.kadikoy}
                  </td>
                  <td className="px-6 py-4 text-center border-r border-slate-100 dark:border-slate-800 font-medium">
                    {product.warehouses.besiktas}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.platforms.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      product.syncStatus === 'Senkronize' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      product.syncStatus === 'Bekliyor' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}>
                      {product.syncStatus === 'Senkronize' ? <CheckCircle2 className="w-3 h-3" /> :
                       product.syncStatus === 'Bekliyor' ? <RefreshCw className="w-3 h-3 animate-spin" /> :
                       <AlertTriangle className="w-3 h-3" />}
                      {product.syncStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
