"use client";

import React, { useMemo } from "react";
import { Bell, AlertTriangle, TrendingDown, Info, PackageX, PackageMinus, Zap, ShieldAlert } from "lucide-react";

export default function SmartAlerts({ products }: { products: any[] }) {
  const lossMakingProducts = useMemo(() => {
    return products.filter(p => {
      const price = p.salePrice || p.price || 0;
      const cost = p.costPrice || 0;
      return price > 0 && cost > 0 && price < cost;
    });
  }, [products]);

  const missingPriceProducts = useMemo(() => {
    return products.filter(p => {
      const price = p.salePrice || p.price || 0;
      const cost = p.costPrice || 0;
      return price === 0 && cost > 0;
    });
  }, [products]);

  const criticalStockProducts = useMemo(() => {
    return products.filter(p => p.stock > 0 && p.stock <= p.criticalLimit);
  }, [products]);

  const zeroStockProducts = useMemo(() => {
    return products.filter(p => p.stock === 0);
  }, [products]);

  const alertsCount = lossMakingProducts.length + missingPriceProducts.length + criticalStockProducts.length + zeroStockProducts.length;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-4">
        
        {/* Zararına Satışlar */}
        <div className="card border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-lg"><TrendingDown className="w-4 h-4"/></div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Zararına Satış Riski</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Maliyetin altında satılan ürünler</p>
            </div>
            <span className="ml-auto bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-rose-200">{lossMakingProducts.length}</span>
          </div>
          <div className="p-4 flex-1 bg-white dark:bg-transparent overflow-y-auto max-h-64">
            {lossMakingProducts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Harika! Zararına satış yapılan ürün bulunmuyor.</p>
            ) : (
              <ul className="space-y-3">
                {lossMakingProducts.map(p => (
                  <li key={p.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.brand} {p.model}</div>
                      <div className="text-xs text-slate-500">{p.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 line-through">{p.costPrice} ₺ Maliyet</div>
                      <div className="font-black text-rose-600">{p.salePrice || p.price} ₺ Satış</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Fiyatı Girilmemiş Ürünler */}
        <div className="card border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-lg"><Info className="w-4 h-4"/></div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Satış Fiyatı Eksik</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Maliyeti olup satış fiyatı girilmeyenler</p>
            </div>
            <span className="ml-auto bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200">{missingPriceProducts.length}</span>
          </div>
          <div className="p-4 flex-1 bg-white dark:bg-transparent overflow-y-auto max-h-64">
            {missingPriceProducts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Tüm ürünlerin fiyatı düzenli görünüyor.</p>
            ) : (
              <ul className="space-y-3">
                {missingPriceProducts.map(p => (
                  <li key={p.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.brand} {p.model}</div>
                      <div className="text-xs text-slate-500">{p.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">{p.costPrice} ₺ Maliyet</div>
                      <div className="font-black text-amber-600">Fiyat Yok</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Kritik Stok Seviyesi */}
        <div className="card border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 rounded-lg"><PackageMinus className="w-4 h-4"/></div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Kritik Stok Uyarıları</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tükenmek üzere olan ürünler</p>
            </div>
            <span className="ml-auto bg-orange-100 text-orange-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-orange-200">{criticalStockProducts.length}</span>
          </div>
          <div className="p-4 flex-1 bg-white dark:bg-transparent overflow-y-auto max-h-64">
            {criticalStockProducts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Şu anda kritik seviyede ürün yok.</p>
            ) : (
              <ul className="space-y-3">
                {criticalStockProducts.map(p => (
                  <li key={p.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.brand} {p.model}</div>
                      <div className="text-xs text-slate-500">Sınır: {p.criticalLimit} adet</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-orange-600">{p.stock}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Stoğu Tükenenler */}
        <div className="card border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"><PackageX className="w-4 h-4"/></div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Stoğu Tükenenler</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mevcudu 0 olan aktif ürünler</p>
            </div>
            <span className="ml-auto bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-600">{zeroStockProducts.length}</span>
          </div>
          <div className="p-4 flex-1 bg-white dark:bg-transparent overflow-y-auto max-h-64">
            {zeroStockProducts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Stoğu tamamen tükenen ürün yok.</p>
            ) : (
              <ul className="space-y-3">
                {zeroStockProducts.map(p => (
                  <li key={p.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.brand} {p.model}</div>
                      <div className="text-xs text-slate-500">{p.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">Stokta Yok</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
