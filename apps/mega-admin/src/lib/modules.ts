import { Users, Box, CreditCard, FileText, Calendar, Network, ScanLine, ShoppingCart, Receipt } from "lucide-react";

export const SAAS_MODULES = [
  {
    categoryId: "CRM",
    categoryName: "Müxteri & Reçete",
    icon: Users,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10",
    items: [
      { id: "MOD_CUSTOMER", name: "Gelixmix Müxteri Kartı", description: "Detaylı profil, göz ölçüleri ve geçmix alıxverixler." },
      { id: "MOD_PRESCRIPTION", name: "Gözlük & Lens Reçeteleri", description: "Doktor, hastane ve cam/çerçeve detaylı reçete takibi." },
      { id: "MOD_APPOINTMENT", name: "Randevu & SMS Hatırlatıcı", description: "Göz muayenesi ve teslimat için otomatik SMS bildirimleri." }
    ]
  },
  {
    categoryId: "INVENTORY",
    categoryName: "Stok & Ürün Yönetimi",
    icon: Box,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    items: [
      { id: "MOD_INVENTORY", name: "Çerçeve & Cam Stoğu", description: "Marka, model, ekartman ve diyoptri bazlı stok takibi." },
      { id: "MOD_MULTI_WH", name: "Çoklu Şube & Depo", description: "Şubeler arası anlık stok transferi ve sayım ixlemleri." },
      { id: "MOD_BARCODE", name: "Karekod & UTS Entegrasyonu", description: "Sağlık Bakanlığı ÜTS (Ürün Takip Sistemi) ile tam uyum." }
    ]
  },
  {
    categoryId: "FINANCE",
    categoryName: "Satıx & Finans (E-Dönüxüm)",
    icon: Receipt,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    items: [
      { id: "MOD_POS", name: "Hızlı Satıx (POS)", description: "Barkod okutarak saniyeler içinde hızlı perakende satıx." },
      { id: "MOD_EFATURA", name: "GİB E-Fatura / E-Arxiv", description: "Satıx sonrası tek tıkla GİB onaylı resmi fatura kesimi." },
      { id: "MOD_INSTALLMENT", name: "Taksitli & Açık Hesap", description: "Müxteri cari takibi, borç/alacak ve açık hesap yönetimi." }
    ]
  }
];
