"use client";

import React, { useState } from "react";
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

interface CustomerImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomerImportModal({ onClose, onSuccess }: CustomerImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setPreviewData(data.slice(0, 5)); // show first 5
      } catch (err) {
        toast.error("Excel dosyası okunamadı.");
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error("Dosya boş.");
          setIsProcessing(false);
          return;
        }

        // Map data to expected format if needed
        // Assuming columns: Ad, Soyad, Telefon, E-Posta, TC, Adres, Notlar
        const mappedData = data.map((row: any) => ({
          firstName: row["Ad"] || row["Adı"] || row["firstName"] || row["FirstName"] || "",
          lastName: row["Soyad"] || row["Soyadı"] || row["lastName"] || row["LastName"] || "",
          phone: row["Telefon"] || row["Phone"] || row["Cep"] || row["phone"] || "",
          email: row["E-Posta"] || row["E-posta"] || row["Email"] || row["email"] || "",
          tcNo: row["TC"] || row["TCKN"] || row["tcNo"] || "",
          address: row["Adres"] || row["Address"] || row["address"] || "",
          notes: row["Notlar"] || row["Not"] || row["notes"] || "",
        }));

        const res = await fetch("/api/admin/data/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "customers", data: mappedData })
        });

        const result = await res.json();
        if (res.ok) {
          toast.success("Müşteriler başarıyla aktarıldı!");
          onSuccess();
        } else {
          toast.error(result.error || "Aktarım başarısız oldu.");
        }
      } catch (err) {
        toast.error("Dosya işlenirken hata oluştu.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isProcessing && onClose()} />
      <div className="relative bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">Toplu Müşteri Aktarımı</h2>
              <p className="text-sm text-muted-foreground">Excel dosyası (xlsx) ile binlerce müşteriyi sisteme yükleyin.</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isProcessing} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-bold mb-1">Excel dosyanızdaki sütun başlıkları şu şekilde olmalıdır:</p>
              <p>Ad, Soyad, Telefon, E-Posta, TC, Adres, Notlar</p>
              <p className="mt-2 text-xs opacity-80">* Telefon numarası aynı olan kayıtlar atlanacaktır.</p>
            </div>
          </div>

          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileSpreadsheet className="w-10 h-10 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
                <p className="mb-2 text-sm text-slate-500 font-semibold"><span className="text-primary">Dosya seçmek için tıklayın</span> veya sürükleyip bırakın</p>
                <p className="text-xs text-slate-400">XLSX veya CSV</p>
              </div>
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{file.name}</p>
                    <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPreviewData([]); }} className="text-sm text-emerald-700 hover:underline font-medium">Değiştir</button>
              </div>

              {previewData.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 text-xs font-bold text-slate-500">Önizleme (İlk 5 Kayıt)</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          {Object.keys(previewData[0]).map((key) => (
                            <th key={key} className="px-4 py-2 font-semibold text-slate-500">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {previewData.map((row, i) => (
                          <tr key={i} className="bg-white dark:bg-slate-900/50">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-2 text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} disabled={isProcessing} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Vazgeç</button>
            <button 
              onClick={handleImport} 
              disabled={!file || isProcessing} 
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {isProcessing ? "Aktarılıyor..." : "İçe Aktar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
