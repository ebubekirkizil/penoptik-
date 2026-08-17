"use client";

import React, { useState, useRef } from "react";
import { Download, Upload, FileSpreadsheet, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function DataManagementTab() {
  const [loading, setLoading] = useState(false);
  const [importType, setImportType] = useState<"customers" | "inventory" | null>(null);
  const [showExportModal, setShowExportModal] = useState<"customers" | "inventory" | null>(null);
  const [exportOptions, setExportOptions] = useState({
    prescriptions: false,
    orders: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadExcel = (data: any[] | { sheetName: string; data: any[] }[], filename: string) => {
    const workbook = XLSX.utils.book_new();
    
    if (Array.isArray(data) && data.length > 0 && !('sheetName' in data[0])) {
       // Single sheet array
       const worksheet = XLSX.utils.json_to_sheet(data);
       XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    } else {
       // Multiple sheets array
       (data as { sheetName: string; data: any[] }[]).forEach(sheet => {
          const worksheet = XLSX.utils.json_to_sheet(sheet.data);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
       });
    }

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleExport = async (type: "customers" | "inventory") => {
    setLoading(true);
    setShowExportModal(null);
    try {
      let url = `/api/admin/data/export?type=${type}`;
      if (type === "customers") {
        if (exportOptions.prescriptions) url += `&prescriptions=true`;
        if (exportOptions.orders) url += `&orders=true`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Dışa aktarma başarısız");
      const data = await res.json();
      
      if (Array.isArray(data) ? data.length === 0 : Object.keys(data).length === 0) {
        toast.error("Dışa aktarılacak kayıt bulunamadı.");
        return;
      }

      downloadExcel(data, `${type === "customers" ? "Musteriler" : "Stok_Listesi"}_${new Date().toISOString().split('T')[0]}`);
      toast.success("Excel dosyası başarıyla indirildi.");
    } catch (e: any) {
      toast.error(e.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = (type: "customers" | "inventory") => {
    setImportType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importType) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error("Excel dosyası boş.");
          setLoading(false);
          return;
        }

        // Map Turkish columns to English keys if necessary
        const mappedData = data.map((row: any) => {
          if (importType === "customers") {
            return {
              firstName: row["İsim"] || row["firstName"] || row["Ad"] || "",
              lastName: row["Soyisim"] || row["lastName"] || row["Soyad"] || "",
              phone: String(row["Telefon"] || row["phone"] || ""),
              email: row["E-posta"] || row["email"] || "",
              tcNo: String(row["TC Kimlik"] || row["tcNo"] || ""),
              address: row["Adres"] || row["address"] || "",
              notes: row["Notlar"] || row["notes"] || "",
            };
          } else {
            return {
              name: row["Ürün Adı"] || row["name"] || "",
              vendor: row["Marka"] || row["vendor"] || "",
              barcode: row["Barkod"] || row["barcode"] || "",
              category: row["Kategori"] || row["category"] || "OTHER",
              costPrice: row["Alış Fiyatı"] || row["costPrice"] || 0,
              price: row["Satış Fiyatı"] || row["price"] || 0,
              stock: row["Stok Miktarı"] || row["stock"] || 0,
              color: row["Renk"] || row["color"] || "",
              size: row["Beden/Ekartman"] || row["size"] || "",
            };
          }
        });

        const res = await fetch("/api/admin/data/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: importType, data: mappedData })
        });

        const result = await res.json();
        if (res.ok) {
          toast.success(result.message || "Veriler başarıyla içe aktarıldı.");
        } else {
          toast.error(result.error || "İçe aktarma sırasında hata oluştu.");
        }
      } catch (err: any) {
        toast.error("Dosya okunamadı veya format hatalı.");
      } finally {
        setLoading(false);
        setImportType(null);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Toplu Veri Aktarımı Hakkında Önemli Bilgi</h4>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Excel'den veri yüklerken sistem mevcut kayıtları kontrol eder. Stok aktarımlarında <strong className="font-bold text-amber-900 dark:text-amber-200">aynı barkoda sahip ürünler</strong> güncellenir, yeni barkodlu olanlar yeni ürün olarak eklenir. Lütfen yükleme yapmadan önce mevcut listenizi indirerek şablon yapısını inceleyiniz.
            </p>
          </div>
        </div>
      </div>

      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Müşteriler Modülü */}
        <div className="bg-surface border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-foreground mb-2">Müşteri Kayıtları</h3>
          <p className="text-sm text-muted-foreground mb-6">Tüm müşteri listesini Excel olarak indirin veya hazır şablonunuza göre topluca sisteme yeni müşteriler ekleyin.</p>
          
          <div className="flex flex-col gap-3">
            <button 
              disabled={loading}
              onClick={() => setShowExportModal("customers")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface border border-[var(--border-color)] text-sm font-bold text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50">
              {loading && importType !== "customers" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-blue-500" />}
              Excel Olarak İndir (Dışa Aktar)
            </button>
            <button 
              disabled={loading}
              onClick={() => handleImportClick("customers")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50">
              {loading && importType === "customers" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Excel'den Yükle (İçe Aktar)
            </button>
          </div>
        </div>

        {/* Stok Modülü */}
        <div className="bg-surface border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-foreground mb-2">Stok / Ürün Listesi</h3>
          <p className="text-sm text-muted-foreground mb-6">Mevcut stoklarınızı fiyatları ve barkodlarıyla birlikte indirin veya toplu ürün listesini sisteme aktarın.</p>
          
          <div className="flex flex-col gap-3">
            <button 
              disabled={loading}
              onClick={() => handleExport("inventory")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface border border-[var(--border-color)] text-sm font-bold text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50">
              {loading && importType !== "inventory" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-emerald-500" />}
              Excel Olarak İndir (Dışa Aktar)
            </button>
            <button 
              disabled={loading}
              onClick={() => handleImportClick("inventory")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50">
              {loading && importType === "inventory" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Excel'den Yükle (İçe Aktar)
            </button>
          </div>
        </div>
      </div>

      {showExportModal === "customers" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExportModal(null)} />
          <div className="relative bg-surface rounded-3xl border border-[var(--border-color)] shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-500" /> Dışa Aktarma Seçenekleri
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Müşteri Excel dosyasına hangi bilgilerin ekleneceğini seçin.</p>
            
            <div className="space-y-3 mb-8">
              <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-primary/20 bg-primary/5 cursor-not-allowed opacity-80">
                <input type="checkbox" checked disabled className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/30 cursor-not-allowed" />
                <div>
                  <div className="font-bold text-sm text-foreground">Kişisel Bilgiler (Zorunlu)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Ad, Soyad, Telefon, E-posta, Adres vb. temel bilgiler.</div>
                </div>
              </label>
              
              <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${exportOptions.prescriptions ? "border-primary bg-primary/5" : "border-[var(--border-color)] hover:border-primary/50"}`}>
                <input type="checkbox" checked={exportOptions.prescriptions} onChange={e => setExportOptions(p => ({ ...p, prescriptions: e.target.checked }))} className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30" />
                <div>
                  <div className="font-bold text-sm text-foreground">Reçete Kayıtları</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Müşteriye ait göz ölçümleri ve reçete geçmişi ayrı bir sayfada yer alır.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${exportOptions.orders ? "border-primary bg-primary/5" : "border-[var(--border-color)] hover:border-primary/50"}`}>
                <input type="checkbox" checked={exportOptions.orders} onChange={e => setExportOptions(p => ({ ...p, orders: e.target.checked }))} className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30" />
                <div>
                  <div className="font-bold text-sm text-foreground">Sipariş & Finansal Kayıtlar</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Müşterinin geçmiş siparişleri, ödemeleri ve bakiye durumu ayrı bir sayfada yer alır.</div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowExportModal(null)} className="flex-1 py-3 bg-surface border border-[var(--border-color)] font-bold text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">İptal</button>
              <button onClick={() => handleExport("customers")} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> İndir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
