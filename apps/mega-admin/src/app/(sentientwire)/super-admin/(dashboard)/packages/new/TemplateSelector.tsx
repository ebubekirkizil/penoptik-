"use client";

import { Copy, Sparkles, Building2, Stethoscope, ShoppingBag } from "lucide-react";

export function TemplateSelector() {
  const applyTemplate = (type: "optik" | "clinic" | "retail") => {
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    const priceInput = document.querySelector('input[name="price"]') as HTMLInputElement;
    const descInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const checkboxes = document.querySelectorAll('input[name="modules"]') as NodeListOf<HTMLInputElement>;

    // Reset all checkboxes first
    checkboxes.forEach(cb => cb.checked = false);

    if (type === "optik") {
      if (nameInput) nameInput.value = "Pen Optik Enterprise Suite";
      if (priceInput) priceInput.value = "12500";
      if (descInput) descInput.value = "Optik mağazaları için özel olarak gelixtirilmix; reçete takibi, çoklu xube depo yönetimi ve e-fatura destekli tam donanımlı B2B/B2C paketi.";
      
      // Select Optic specific modules
      const opticModules = ["MOD_CUSTOMER", "MOD_PRESCRIPTION", "MOD_APPOINTMENT", "MOD_INVENTORY", "MOD_MULTI_WH", "MOD_BARCODE", "MOD_POS", "MOD_EFATURA", "MOD_INSTALLMENT"];
      checkboxes.forEach(cb => {
        if (opticModules.includes(cb.value)) cb.checked = true;
      });
    } else if (type === "retail") {
      if (nameInput) nameInput.value = "Standart Perakende Paketi";
      if (priceInput) priceInput.value = "5000";
      if (descInput) descInput.value = "Hızlı satıx (POS), temel stok ve e-fatura özellikleriyle perakende mağazaları için ideal paket.";
      
      const retailModules = ["MOD_CUSTOMER", "MOD_INVENTORY", "MOD_BARCODE", "MOD_POS", "MOD_EFATURA"];
      checkboxes.forEach(cb => {
        if (retailModules.includes(cb.value)) cb.checked = true;
      });
    } else if (type === "clinic") {
      if (nameInput) nameInput.value = "Klinik & Randevu Yönetim Paketi";
      if (priceInput) priceInput.value = "8500";
      if (descInput) descInput.value = "Klinikler için SMS hatırlatıcı, detaylı müxteri kartı ve açık hesap takibi sağlayan hizmet odaklı paket.";
      
      const clinicModules = ["MOD_CUSTOMER", "MOD_APPOINTMENT", "MOD_POS", "MOD_INSTALLMENT"];
      checkboxes.forEach(cb => {
        if (clinicModules.includes(cb.value)) cb.checked = true;
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl p-6 border border-indigo-500/20 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-400">Hazır Şablonlar (Tek Tıkla Kurulum)</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          type="button"
          onClick={() => applyTemplate("optik")}
          className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-slate-700 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
        >
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Pen Optik İskeleti</div>
            <div className="text-xs text-slate-500 mt-1">Tüm optik legolarını içerir.</div>
          </div>
        </button>

        <button 
          type="button"
          onClick={() => applyTemplate("retail")}
          className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
        >
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Perakende (Retail)</div>
            <div className="text-xs text-slate-500 mt-1">POS ve Stok odaklı temel paket.</div>
          </div>
        </button>

        <button 
          type="button"
          onClick={() => applyTemplate("clinic")}
          className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-slate-700 hover:border-rose-500 hover:shadow-md transition-all text-left group"
        >
          <div className="p-2 bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Klinik & Randevu</div>
            <div className="text-xs text-slate-500 mt-1">Hizmet ve randevu odaklı paket.</div>
          </div>
        </button>
      </div>
    </div>
  );
}
