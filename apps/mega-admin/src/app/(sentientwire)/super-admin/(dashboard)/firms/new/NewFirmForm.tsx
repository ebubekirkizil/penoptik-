"use client";

import { Building2, Save, Globe, UserPlus, CreditCard, Info } from "lucide-react";
import { useState } from "react";
import { createFirmAction } from "./actions";

type Package = {
  id: string;
  name: string;
  price: number;
  currency: string;
};

export function NewFirmForm({ packages }: { packages: Package[] }) {
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [useTrial, setUseTrial] = useState(false);
  const [useTieredPricing, setUseTieredPricing] = useState(false);
  const [domainSlug, setDomainSlug] = useState("");

  return (
    <form action={createFirmAction} className="space-y-8">
      {/* Firma Temel Bilgileri */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Şirket Profili</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kurum Adı (Marka)</label>
            <input type="text" name="name" required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white" placeholder="Örn: Dağut Kundura A.Ş." />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sektör / Faaliyet Alanı</label>
            <select name="sector" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white appearance-none font-medium">
              <option value="OPTICS">Gözlük / Optik Sektörü</option>
              <option value="ECOMMERCE">E-Ticaret ve Perakende</option>
              <option value="SERVICE">Hizmet / Kurumsal Çözümler</option>
              <option value="ERP_GENERAL">Genel Üretim ve Lojistik</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Resmi E-posta</label>
            <input type="email" name="email" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white" placeholder="info@kurum.com" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kurumsal Telefon</label>
            <input type="text" name="phone" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white" placeholder="+90 532 000 0000" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Açık Adres</label>
            <textarea name="address" rows={2} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white" placeholder="Firma açık adresi..."></textarea>
          </div>
        </div>
      </div>

      {/* Domain & Bağlantı */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kurumsal Alan Adı (Domain) Entegrasyonu</h2>
            <p className="text-xs text-slate-500 mt-1">Müxterinin kendisine ait bir alan adıyla (White-label) hizmet alabilmesi için ayarlar.</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Özel Alan Adı (Opsiyonel)</label>
            <div className="flex relative shadow-sm rounded-xl">
              <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0F172A] text-slate-500 text-sm font-bold">
                https://
              </span>
              <input 
                type="text" 
                name="domain" 
                value={domainSlug}
                onChange={(e) => setDomainSlug(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-r-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all text-slate-900 dark:text-white" 
                placeholder="kurumadi.com veya ornekoptik" 
              />
            </div>

            {domainSlug && (
              <div className="mt-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-1 font-medium">Bu firmanın müxterileri için geçici B2C portal linki (Kopyalayabilirsiniz):</p>
                <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-2 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                  <code className="text-emerald-600 dark:text-emerald-400 text-sm font-bold truncate">
                    https://sentientwire.com/business/{domainSlug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}
                  </code>
                </div>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-sky-50 dark:bg-sky-500/5 rounded-xl border border-sky-100 dark:border-sky-500/20 flex gap-4 items-start">
              <div className="shrink-0 mt-0.5">
                <Info className="w-5 h-5 text-sky-500" />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                <p><strong>Nasıl Çalıxır?</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Yöntem 1 (Özel Alan Adı):</strong> Müxteriniz yukarıya yazdığınız alan adını bağlarsa, kendi müxterileri ve personeli doğrudan o adresten girix yapar. <em>(Müxterinin alan adının DNS A kaydını IP adresimize yönlendirmesi gerekir. Sistem otomatik SSL oluxturur.)</em></li>
                  <li><strong>Yöntem 2 (Merkezi Girix):</strong> Alan adı bağlamazsanız, müxteriniz <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">sentientwire.com/login</code> üzerinden e-posta ve xifresiyle girix yaptığında sistem onu otomatik olarak kendi paneline ve firmasına yönlendirir.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kurucu Yönetici (İlk Kullanıcı) */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Müxteri Yöneticisi Yetkilendirmesi</h2>
            <p className="text-xs text-slate-500 mt-1">Sistemi teslim alacak olan Kurucu Admin hesabının bilgileri.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Yönetici Adı Soyadı</label>
            <input type="text" name="adminName" required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white" placeholder="Örn: Ahmet Yılmaz" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Girix E-postası (Oturum Açma ID'si)</label>
            <input type="email" name="adminEmail" required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white" placeholder="yonetici@kurum.com" />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Geçici Erixim Şifresi</label>
            <input type="text" name="adminPassword" required defaultValue="123456" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white font-mono" />
            <p className="text-xs text-slate-500 mt-2">Müxteri ilk baxarılı girixinde bu xifreyi değixtirmeye zorlanacaktır. (Güvenlik Politikası)</p>
          </div>
        </div>
      </div>

      {/* Abonelik ve Dinamik Plan Seçimi */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dinamik Abonelik Modeli & Lisanslama</h2>
            <p className="text-xs text-slate-500 mt-1">Müxteriye özel paket atayın, fiyatı özellextirin veya deneme süresi tanımlayın.</p>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Temel Paket (Lisans Türü)</label>
            <select name="packageId" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-slate-900 dark:text-white appearance-none font-bold">
              <option value="">-- Müxteriye Uygun Paketi Seçin --</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.price.toLocaleString("tr-TR")} {pkg.currency} / Ay)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Özel Fiyatlandırma Toggle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 justify-between hover:border-amber-500 transition-colors">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Özel Fiyatlandırma</h4>
                <p className="text-xs text-slate-500 mt-1">Paket fiyatı yerine bu müxteriye özel sabit bir aylık fiyat tanımlayın.</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => setUseCustomPrice(!useCustomPrice)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useCustomPrice ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useCustomPrice ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              {useCustomPrice && (
                <div className="mt-2 animate-in fade-in zoom-in duration-200">
                  <input type="number" name="customPrice" step="0.01" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="Örn: 2499.00" />
                </div>
              )}
            </div>

            {/* Ücretsiz Deneme Toggle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 justify-between hover:border-amber-500 transition-colors">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Ücretsiz Deneme (Trial)</h4>
                <p className="text-xs text-slate-500 mt-1">Müxteriye belli bir gün kadar ücretsiz kullanım hakkı tanımlayın.</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => setUseTrial(!useTrial)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useTrial ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useTrial ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              {useTrial && (
                <div className="mt-2 animate-in fade-in zoom-in duration-200">
                  <input type="number" name="trialDays" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="Gün sayısı (Örn: 14)" />
                </div>
              )}
            </div>

            {/* Kademeli Fiyatlandırma Toggle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 justify-between hover:border-amber-500 transition-colors">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">İlk Ay İndirimi (Kademeli)</h4>
                <p className="text-xs text-slate-500 mt-1">Müxterinin ilk ay faturası için farklı bir fiyat uygulayın, sonra normale döner.</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => setUseTieredPricing(!useTieredPricing)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useTieredPricing ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useTieredPricing ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <input type="hidden" name="isTieredPricing" value={useTieredPricing ? "true" : "false"} />
              </div>
              {useTieredPricing && (
                <div className="mt-2 animate-in fade-in zoom-in duration-200">
                  <input type="number" name="tieredPrice" step="0.01" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="İlk ay fiyatı (Örn: 49.00)" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button type="submit" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <Save className="w-5 h-5" />
          Altyapıyı Oluxtur ve Kurulumu Baxlat
        </button>
      </div>
    </form>
  );
}
