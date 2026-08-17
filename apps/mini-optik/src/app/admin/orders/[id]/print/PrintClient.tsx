"use client";

import { useEffect, useState } from "react";
import { Printer, ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PrintClient({ orderId, orderNo }: { orderId: string, orderNo: string }) {
  const router = useRouter();
  const [printing, setPrinting] = useState(false);
  const [paperSize, setPaperSize] = useState("A4");

  useEffect(() => {
    // Yazdırma sırasında sayfa boyutunu CSS değişkeni olarak ayarlıyoruz
    document.documentElement.style.setProperty("--print-size", paperSize);
    
    // Ekranda önizleme (preview) yapabilmek için kapsayıcı genişliğini ayarlıyoruz
    const printArea = document.getElementById("print-area");
    if (printArea) {
      if (paperSize === "A3") {
        printArea.style.maxWidth = "297mm";
        printArea.style.minHeight = "420mm";
        printArea.style.fontSize = "16px";
      } else if (paperSize === "A4") {
        printArea.style.maxWidth = "210mm";
        printArea.style.minHeight = "297mm";
        printArea.style.fontSize = "14px";
      } else if (paperSize === "A5") {
        printArea.style.maxWidth = "148mm";
        printArea.style.minHeight = "210mm";
        printArea.style.fontSize = "10px";
      } else if (paperSize === "A6") {
        printArea.style.maxWidth = "105mm";
        printArea.style.minHeight = "148mm";
        printArea.style.fontSize = "8px";
      }
    }
  }, [paperSize]);

  // Automatically open print dialog when ready, if desired. 
  // We will let the user click it so we can log the action first.

  const handlePrint = async () => {
    try {
      setPrinting(true);
      
      // Log the print action
      await fetch(`/api/orders/${orderId}/log-print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo, paperSize })
      });
      
      // Execute print
      window.print();
    } catch (error) {
      console.error(error);
      toast.error("Yazdırılırken bir hata oluştu");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 mb-8 bg-surface/50 border border-border-color rounded-2xl print:hidden">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
      >
        <ArrowLeft className="w-4 h-4" /> Geri Dön
      </button>
      <div className="flex items-center gap-4">
        
        <div className="flex items-center gap-2 bg-background border border-border-color rounded-lg px-3 py-1.5 hidden sm:flex">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <select 
            value={paperSize} 
            onChange={(e) => setPaperSize(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none text-foreground cursor-pointer"
          >
            <option value="A3">A3 Boyut (Büyük)</option>
            <option value="A4">A4 Boyut (Standart)</option>
            <option value="A5">A5 Boyut (Yarım)</option>
            <option value="A6">A6 Boyut (Küçük)</option>
          </select>
        </div>

        <p className="text-xs text-muted-foreground hidden md:block">
          * Tarayıcı yazdırma ayarlarından da boyutu teyit ediniz.
        </p>

        <button
          onClick={handlePrint}
          disabled={printing}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Printer className="w-4 h-4" /> {printing ? "Hazırlanıyor..." : "Çıktı Al (Yazdır)"}
        </button>
      </div>
    </div>
  );
}
