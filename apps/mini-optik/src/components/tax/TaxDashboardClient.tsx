// @ts-nocheck
"use client";

import React, { useState, useMemo } from 'react';
import TaxCalendar from '@/components/tax/TaxCalendar';
import TaxAIBot from '@/components/tax/TaxAIBot';
import { calculateTax, CompanyType, applyYoungEntrepreneurExemption, applyServiceExportExemption } from '@/lib/tax-calculator';
import { Calculator, TrendingUp, PiggyBank, ShieldCheck, Building, User, Info, DollarSign, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

export default function TaxDashboardClient({ 
  realRevenue = 0, 
  hasEInvoice = false 
}: { 
  realRevenue?: number, 
  hasEInvoice?: boolean 
}) {
  const [isRealData, setIsRealData] = useState<boolean>(hasEInvoice);
  const [profitInput, setProfitInput] = useState<number>(750000);
  const [isYoung, setIsYoung] = useState(false);
  const [isExport, setIsExport] = useState(false);

  const profit = isRealData ? realRevenue : profitInput;

  // --- HESAPLAMALAR ---
  // Şahıs Şirketi Matrah ve Vergi
  let sahisTaxBase = profit;
  if (isExport) sahisTaxBase = applyServiceExportExemption(sahisTaxBase);
  if (isYoung) sahisTaxBase = applyYoungEntrepreneurExemption(sahisTaxBase);
  const sahisTax = calculateTax(CompanyType.SAHIS, sahisTaxBase);
  const sahisEffectiveRate = profit > 0 ? (sahisTax.taxAmount / profit) * 100 : 0;

  // Limited/Anonim Şirket Matrah ve Vergi
  let ltdTaxBase = profit;
  if (isExport) ltdTaxBase = applyServiceExportExemption(ltdTaxBase);
  const ltdTax = calculateTax(CompanyType.LIMITED, ltdTaxBase);
  const ltdEffectiveRate = profit > 0 ? (ltdTax.taxAmount / profit) * 100 : 0;

  // --- AKILLI TAVSİYELER ---
  const smartAdvices = useMemo(() => {
    const advices = [];
    
    // Şirket Türü Kıyaslaması
    if (sahisTax.taxAmount > ltdTax.taxAmount) {
      advices.push({
        title: "Şirket Türü Değişimi",
        desc: `Mevcut kazancınızla Limited veya Anonim Şirket statüsünde olmanız, Şahıs şirketine göre size ${(sahisTax.taxAmount - ltdTax.taxAmount).toLocaleString('tr-TR')} TL vergi avantajı sağlamaktadır.`,
        type: "advantage"
      });
    }

    // Hizmet İhracatı Uyarıları
    if (isExport) {
      advices.push({
        title: "Döviz Getirme Şartı (Hizmet İhracatı)",
        desc: "Kazancınızın %80'i vergiden istisna edilmiştir. Ancak bu haktan yararlanabilmek için ödemelerin Euro, USD vb. döviz cinsinden resmi yollarla Türkiye'ye getirilmesi ve dekontlanması şarttır.",
        type: "warning"
      });
    } else {
      advices.push({
        title: "Yurt Dışına İş Yapıyor Musunuz?",
        desc: "Yazılım, tasarım, mimarlık gibi hizmetleri yurt dışına ihraç ediyorsanız, gelirin %80'i kurumlar/gelir vergisinden istisnadır. Varsa yandaki kutucuğu işaretleyerek avantajı görün.",
        type: "info"
      });
    }

    // Genç Girişimci
    if (isYoung) {
      advices.push({
        title: "Genç Girişimci İstisnası Aktif",
        desc: "230.000 TL'lik kazancınız gelir vergisinden muaf tutuldu. Ayrıca 1 yıllık Bağ-Kur primleriniz devlet tarafından karşılanıyor.",
        type: "success"
      });
    } else if (!isYoung && profit > 0 && profit < 500000) {
       advices.push({
        title: "29 Yaşından Küçük Müsünüz?",
        desc: "Şahıs şirketi kurarken 29 yaşından küçükseniz, Genç Girişimci İstisnası ile 230.000 TL'ye kadar vergiden muaf olabilirsiniz.",
        type: "info"
      });
    }

    // SGK ve Yemek Giderleri
    advices.push({
      title: "SGK ve Yemek Ödenekleri",
      desc: "Çalışanlarınıza verdiğiniz yemek ödeneklerini nakit yerine 'Yemek Kartı' ile vererek SGK primlerinden istisna sağlayabilir, kurum kazancınızdan düşerek vergi matrahınızı azaltabilirsiniz.",
      type: "info"
    });

    // E-Fatura Tavsiyesi
    if (!hasEInvoice) {
      advices.push({
        title: "E-Fatura & E-Arşiv Kullanımı",
        desc: "Mevcut sisteminizde e-fatura entegrasyonu (Uyumsoft vb.) aktif görünmüyor. E-Ticaret siparişlerinizde devlete otomatik e-Arşiv keserek hem zamandan tasarruf edebilir hem de vergi matrahınızı asistanımıza otomatik aktarabilirsiniz.",
        type: "warning"
      });
    }

    return advices;
  }, [profit, isExport, isYoung, sahisTax.taxAmount, ltdTax.taxAmount, hasEInvoice]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calculator className="w-8 h-8 text-primary" />
            Vergi & Muhasebe Asistanı
          </h1>
          <p className="text-muted-foreground mt-1">
            Türkiye Cumhuriyeti vergi yasalarına uygun optimizasyon ve beyanname takibi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol Kolon: Etkileşimli Simülasyon */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              Dinamik Vergi Simülasyonu
            </h2>

            {/* Inputs & Toggle */}
            <div className="bg-muted/30 p-5 rounded-xl border border-border/50 mb-6 space-y-5">
              
              <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${isRealData ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <h4 className="text-sm font-semibold">Canlı Fatura/Sipariş Verileri</h4>
                    <p className="text-xs text-muted-foreground">E-ticaret siparişlerinizden hesaplanır</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRealData(!isRealData)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isRealData ? 'bg-primary' : 'bg-muted-foreground'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRealData ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tahmini Yıllık Net Kar (TL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="number"
                    value={profit || ''}
                    onChange={(e) => setProfitInput(Number(e.target.value))}
                    disabled={isRealData}
                    className={`w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all ${isRealData ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Örn: 750000"
                  />
                  {isRealData && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-xs font-semibold text-primary">SİSTEMDEN ÇEKİLDİ</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isExport}
                    onChange={(e) => setIsExport(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary/50"
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">Yazılım/Hizmet İhracatı (Döviz)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isYoung}
                    onChange={(e) => setIsYoung(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary/50"
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">Genç Girişimci (Şahıs)</span>
                </label>
              </div>
            </div>

            {/* Sonuç Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Şahıs Şirketi */}
              <div className="p-5 rounded-xl border border-border bg-background relative overflow-hidden group hover:border-primary/50 transition-colors shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <User className="w-16 h-16" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Şahıs Şirketi</h3>
                <p className="text-xs text-muted-foreground mb-4">Artan Oranlı Gelir Vergisi</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm pb-2 border-b border-border/50">
                    <span className="text-muted-foreground">Vergi Matrahı:</span>
                    <span className="font-medium">{(sahisTaxBase).toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ödenecek Vergi:</span>
                    <span className="font-bold text-destructive">{(sahisTax.taxAmount).toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Efektif Oran:</span>
                    <span className="font-medium">%{(sahisEffectiveRate).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Limited / Anonim */}
              <div className={`p-5 rounded-xl border relative overflow-hidden group transition-colors shadow-sm ${sahisTax.taxAmount > ltdTax.taxAmount ? 'border-primary/50 bg-primary/5' : 'border-border bg-background hover:border-primary/30'}`}>
                <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${sahisTax.taxAmount > ltdTax.taxAmount ? 'text-primary' : ''}`}>
                  <Building className="w-16 h-16" />
                </div>
                <h3 className={`font-semibold text-lg mb-1 ${sahisTax.taxAmount > ltdTax.taxAmount ? 'text-primary' : ''}`}>Limited / Anonim</h3>
                <p className="text-xs text-muted-foreground mb-4">Sabit Kurumlar Vergisi (%25)</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm pb-2 border-b border-border/50">
                    <span className="text-muted-foreground">Vergi Matrahı:</span>
                    <span className="font-medium">{(ltdTaxBase).toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ödenecek Vergi:</span>
                    <span className="font-bold text-destructive">{(ltdTax.taxAmount).toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Efektif Oran:</span>
                    <span className="font-medium">%{(ltdEffectiveRate).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Akıllı Tavsiyeler (Dinamik) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <PiggyBank className="w-5 h-5 text-primary" />
              Sistemin Akıllı Tavsiyeleri
            </h2>
            <div className="space-y-3">
              {smartAdvices.map((advice, idx) => (
                <div key={idx} className={`p-4 rounded-lg border flex gap-3 ${
                  advice.type === 'advantage' ? 'bg-green-500/10 border-green-500/20' :
                  advice.type === 'warning' ? 'bg-orange-500/10 border-orange-500/20' :
                  advice.type === 'success' ? 'bg-primary/10 border-primary/20' :
                  'bg-muted/30 border-border/50'
                }`}>
                  <div className={`shrink-0 mt-0.5 ${
                    advice.type === 'advantage' ? 'text-green-600 dark:text-green-400' :
                    advice.type === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                    advice.type === 'success' ? 'text-primary' :
                    'text-muted-foreground'
                  }`}>
                    {advice.type === 'warning' ? <Info className="w-5 h-5" /> : 
                     advice.type === 'advantage' ? <TrendingUp className="w-5 h-5" /> : 
                     <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${
                      advice.type === 'advantage' ? 'text-green-700 dark:text-green-400' :
                      advice.type === 'warning' ? 'text-orange-700 dark:text-orange-400' :
                      advice.type === 'success' ? 'text-primary' :
                      'text-foreground'
                    }`}>{advice.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {advice.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sağ Kolon: Takvim */}
        <div className="lg:col-span-1 h-full">
          <TaxCalendar />
        </div>
      </div>

      <TaxAIBot />
    </div>
  );
}
