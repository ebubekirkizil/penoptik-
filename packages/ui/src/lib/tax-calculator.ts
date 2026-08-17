// @ts-nocheck
export enum CompanyType {
  SAHIS = "SAHIS",
  LIMITED = "LIMITED",
  ANONIM = "ANONIM"
}

// 2024 Gelir Vergisi Dilimleri (Gerçek Kişiler / Şahıs Şirketleri için)
export const INCOME_TAX_BRACKETS_2024 = [
  { limit: 110000, rate: 0.15 },
  { limit: 230000, rate: 0.20 },
  { limit: 870000, rate: 0.27 },
  { limit: 3000000, rate: 0.35 },
  { limit: Infinity, rate: 0.40 }
];

export const CORPORATE_TAX_RATE = 0.25; // 2024 Kurumlar Vergisi Genel Oranı %25

export interface TaxCalculationResult {
  taxableIncome: number;
  taxAmount: number;
  effectiveRate: number;
  details: string;
}

/**
 * Şahıs şirketleri (Gerçek Kişiler) için gelir vergisi hesaplaması.
 * Artan oranlı dilimlere göre hesaplar.
 */
export function calculateIncomeTax(netProfit: number): TaxCalculationResult {
  if (netProfit <= 0) {
    return { taxableIncome: 0, taxAmount: 0, effectiveRate: 0, details: "Zarar veya sıfır kar." };
  }

  let taxAmount = 0;
  let remainingProfit = netProfit;
  let previousLimit = 0;

  for (const bracket of INCOME_TAX_BRACKETS_2024) {
    const bracketSize = bracket.limit - previousLimit;
    const amountInBracket = Math.min(remainingProfit, bracketSize);
    
    if (amountInBracket > 0) {
      taxAmount += amountInBracket * bracket.rate;
      remainingProfit -= amountInBracket;
    }
    
    previousLimit = bracket.limit;
    if (remainingProfit <= 0) break;
  }

  return {
    taxableIncome: netProfit,
    taxAmount: taxAmount,
    effectiveRate: (taxAmount / netProfit) * 100,
    details: "Artan oranlı gelir vergisi dilimlerine göre hesaplanmıştır."
  };
}

/**
 * Sermaye şirketleri (Limited, Anonim) için kurumlar vergisi hesaplaması.
 */
export function calculateCorporateTax(netProfit: number): TaxCalculationResult {
  if (netProfit <= 0) {
    return { taxableIncome: 0, taxAmount: 0, effectiveRate: 0, details: "Zarar veya sıfır kar." };
  }

  const taxAmount = netProfit * CORPORATE_TAX_RATE;
  return {
    taxableIncome: netProfit,
    taxAmount: taxAmount,
    effectiveRate: CORPORATE_TAX_RATE * 100,
    details: "Sabit %25 Kurumlar Vergisi oranı uygulanmıştır."
  };
}

/**
 * Genel vergi hesaplama yönlendiricisi
 */
export function calculateTax(companyType: CompanyType, netProfit: number): TaxCalculationResult {
  if (companyType === CompanyType.SAHIS) {
    return calculateIncomeTax(netProfit);
  } else {
    // Limited ve Anonim için
    return calculateCorporateTax(netProfit);
  }
}

/**
 * Basit KDV hesaplaması
 * KDV'si ödenecek matrah (Tahsil edilen KDV - Ödenen KDV)
 */
export function calculateVat(collectedVat: number, paidVat: number): {
  payableVat: number;
  carriedForwardVat: number;
} {
  const diff = collectedVat - paidVat;
  if (diff > 0) {
    return { payableVat: diff, carriedForwardVat: 0 };
  } else {
    return { payableVat: 0, carriedForwardVat: Math.abs(diff) };
  }
}

/**
 * Genç Girişimci İstisnası (2024 için 230.000 TL'ye kadar gelir vergisinden muafiyet)
 * Sadece Şahıs şirketleri ve şartları sağlayanlar için geçerlidir.
 */
export function applyYoungEntrepreneurExemption(netProfit: number): number {
  const EXEMPTION_LIMIT = 230000;
  return Math.max(0, netProfit - EXEMPTION_LIMIT);
}

/**
 * Yazılım, Mühendislik, Tasarım vb. Hizmet İhracatı İstisnası
 * Kazancın %80'i vergiden müstesnadır. Şart: Paranın döviz (Euro/USD vb.) olarak Türkiye'ye getirilmesi.
 */
export function applyServiceExportExemption(netProfit: number): number {
  // Kazancın %80'i vergiden düşülür, %20'si vergilendirilir.
  return netProfit * 0.20;
}
