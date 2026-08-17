"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function CardCheckerContent() {
  const searchParams = useSearchParams();
  const scannedId = searchParams.get("scanned");
  
  const [activeTab, setActiveTab] = useState<'system' | 'physical' | 'write'>('system');
  const [chipData, setChipData] = useState<any[] | null>(null);
  const [scanError, setScanError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [writeSerial, setWriteSerial] = useState("");
  const [writeSuccess, setWriteSuccess] = useState(false);
  const [showWhyAppModal, setShowWhyAppModal] = useState(false);
  const [shouldLock, setShouldLock] = useState(false); // Yeni: Kalıcı kilitleme seçeneği
  const [writeMode, setWriteMode] = useState<'auto' | 'manual'>('auto');
  const [manualPayloadType, setManualPayloadType] = useState<'url' | 'text'>('url');
  const [manualPayloadContent, setManualPayloadContent] = useState('');
  
  // Eksik state tanımlamaları:
  const [loading, setLoading] = useState(false);
  const [cardStatus, setCardStatus] = useState<any>(null);
  const [writePreview, setWritePreview] = useState<any>(null);

  // Sadece sıradaki numarayı bul (sisteme kaydetme)
  const fetchNextSerial = async () => {
    try {
      const res = await fetch('/api/nfc/admin/next-serial');
      const data = await res.json();
      if (data.success && data.nextSerial) {
        setWriteSerial(data.nextSerial);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'write' && !writeSerial && !writePreview) {
      fetchNextSerial();
    }
  }, [activeTab]);

  // Sayfa açık kaldığı sürece checker modunu aktif tutan çerez
  useEffect(() => {
    document.cookie = "card_checker_mode=true; path=/; max-age=3600";
    return () => {
      document.cookie = "card_checker_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    };
  }, []);

  // Eğer route.ts bizi buraya "?scanned=..." ile yönlendirdiyse, veritabanından kartın bilgisini çek
  useEffect(() => {
    if (scannedId) {
      setLoading(true);
      fetch(`/api/nfc/admin/check?scannedId=${scannedId}`)
        .then(res => res.json())
        .then(data => {
          setCardStatus(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setCardStatus({
            id: scannedId,
            type: "HATA",
            status: "Sorgulama Baxarısız",
            isActive: false
          });
          setLoading(false);
        });
    }
  }, [scannedId]);

  const startPhysicalScan = async () => {
    try {
      if ("NDEFReader" in window) {
        setScanError("");
        setChipData(null);
        setIsScanning(true);
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        
        ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
          const records = [];
          for (const record of message.records) {
            try {
              const decoder = new TextDecoder();
              records.push({
                type: record.recordType,
                content: decoder.decode(record.data)
              });
            } catch(e) {
              records.push({
                type: record.recordType,
                content: "[Okunamayan Veri]"
              });
            }
          }
          
          if (records.length === 0) {
            records.push({ type: "empty", content: "Kart formatlanmıx ancak içi tamamen box." });
          }
          
          setChipData(records);
          setIsScanning(false);
        });
        
        ndef.addEventListener("readingerror", () => {
          setScanError("Kart okunamadı. Lütfen tekrar deneyin.");
          setIsScanning(false);
        });
      } else {
        setScanError("Tarayıcınız Web NFC desteklemiyor. Lütfen Android'de Chrome kullanın.");
      }
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      setScanError("NFC izni verilmedi veya donanım hatası oluxtu.");
    }
  };

  const previewWriteCard = async () => {
    if (!writeSerial) return;
    setScanError("");
    setWriteSuccess(false);
    
    try {
      const res = await fetch(`/api/nfc/admin/check?scannedId=${writeSerial}`);
      let data = await res.json();
      
      // Sisteme otomatik kaydetme (Kullanıcı 'BİLİNMİYOR' olan bir id girdiyse)
      if (data && data.type === "BİLİNMİYOR") {
        const createRes = await fetch('/api/nfc/admin/create-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serialCode: writeSerial })
        });
        const createData = await createRes.json();
        if (createData.success) {
          data = {
            id: createData.card.serialCode,
            pass: createData.card.activationCode
          };
        } else {
          setScanError("Sisteme kayıt edilemedi.");
          setWritePreview(null);
          return;
        }
      }

      if (data && data.id && data.pass) {
        // Link oluxtur
        const url = `https://sentientwire.com/nfc/${data.id}?pass=${data.pass}`;
        setWritePreview({
          id: data.id,
          url
        });
      } else {
        setScanError("Bu seri numarasına ait kart bulunamadı.");
        setWritePreview(null);
      }
    } catch (error) {
      setScanError("Sorgulama sırasında bir hata oluxtu.");
    }
  };

  const startWrite = async () => {
    if (writeMode === 'auto' && !writeSerial) return;
    if (writeMode === 'manual' && !manualPayloadContent.trim()) {
      setScanError("Lütfen yazılacak linki veya içeriği girin.");
      return;
    }

    if (!("NDEFReader" in window)) {
      setScanError("Tarayıcınız Web NFC desteklemiyor. Lütfen Android cihazda Chrome kullanın.");
      return;
    }

    try {
      setScanError("");
      setIsScanning(true);
      setWriteSuccess(false);
      setWritePreview(null);

      const ndef = new (window as any).NDEFReader();

      let writeRecords: any[] = [];

      if (writeMode === 'manual') {
        // Manuel mod: kullanıcının girdiği içeriği doğrudan yaz
        writeRecords = [{ recordType: manualPayloadType, data: manualPayloadContent.trim() }];
        setWritePreview({
          id: 'MANUEL KODLAMA',
          url: manualPayloadContent.trim()
        });
      } else {
        // Otomatik mod: sisteme kaydet, URL üret
        const createRes = await fetch('/api/nfc/admin/create-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serialCode: writeSerial })
        });
        const createData = await createRes.json();

        if (!createData.success) {
          setScanError("Sisteme kayıt edilemedi: " + (createData.error || "Bilinmeyen hata"));
          setIsScanning(false);
          return;
        }

        const url = `https://sentientwire.com/nfc/${createData.card.serialCode}?pass=${createData.card.activationCode}`;
        setWritePreview({
          id: createData.card.serialCode,
          url
        });
        writeRecords = [{ recordType: "url", data: url }];
      }

      // Doğrudan kartı yaz — scan() gereksiz, write() kendi baxına kartı bekler
      await ndef.write({ records: writeRecords });

      if (shouldLock) {
        await ndef.makeReadOnly();
      }

      setWriteSuccess(true);
      setIsScanning(false);

    } catch (error: any) {
      console.error(error);
      setIsScanning(false);
      if (error.name === 'NotAllowedError') {
        setScanError("NFC izni reddedildi. Lütfen tarayıcıya NFC izni verin.");
      } else if (error.name === 'NotSupportedError') {
        setScanError("Bu cihaz/tarayıcı Web NFC desteklemiyor. Android Chrome kullanın.");
      } else {
        setScanError("Hata: " + (error.message || "Kart yazılamadı. Tekrar deneyin."));
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NFC Kart Araçları</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Kartların sistemdeki durumunu sorgulayın, içeriklerini inceleyin veya yeni kart kodlayın.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Desktop Message */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Uygulamayı indirebilmek için siteye telefonunuzdan giriniz
          </div>

          {/* Mobile Download Button */}
          <a 
            href="/sentientwire-admin.apk" 
            download
            className="md:hidden flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Donanım Şifreleme Uygulamasını İndir
          </a>

          <button 
            onClick={() => setShowWhyAppModal(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Neden uygulama indirmeliyim?
          </button>
        </div>
      </div>
      
      {/* Tab Menü */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-slate-700">
        <button 
          onClick={() => setActiveTab('system')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'system' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
        >
          Sistem Kayıt Sorgulama (Pasif)
        </button>
        <button 
          onClick={() => setActiveTab('physical')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'physical' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
        >
          Fiziksel Çip İnceleme (Okuma)
        </button>
        <button 
          onClick={() => setActiveTab('write')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'write' ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
        >
          Çipe URL Yaz (Kodlama)
        </button>
      </div>

      {activeTab === 'system' && (
        <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-2xl p-8 md:p-12 text-center shadow-sm max-w-xl mx-auto">
          <div className="px-4 py-2 bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 rounded-full text-sm font-bold animate-pulse inline-flex items-center gap-2 mx-auto mb-8">
            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></div>
            Pasif Sorgulama Modu Aktif
          </div>
          <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">URL Bekleniyor...</h3>
          <p className="text-gray-500 dark:text-slate-400 mt-2 mb-6">
            İçinde link olan bir kartı okutun. Telefonunuz linki açtığında, sistem kartın veritabanındaki durumunu buraya yansıtacaktır. (İzin gerektirmez)
          </p>
        </div>
      )}

      {activeTab === 'physical' && (
        <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-2xl p-8 md:p-12 text-center shadow-sm max-w-xl mx-auto">
          <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className={`w-10 h-10 ${isScanning ? 'text-blue-600 animate-pulse' : 'text-gray-400 dark:text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {isScanning ? "Çip Okunuyor, Kartı Yaklaxtırın..." : "Fiziksel İçerik İnceleme"}
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mt-2 mb-6">
            Bu mod, kartın çipinin içine fiziksel olarak ne yazıldığını okur (Link, Metin, Box). Tarayıcı NFC izni gerektirir. (Karta ASLA veri yazmaz)
          </p>

          {!isScanning && (
            <button 
              onClick={startPhysicalScan}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md w-full sm:w-auto"
            >
              İzin Ver ve Çipi Oku
            </button>
          )}

          {scanError && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium">
              {scanError}
            </div>
          )}

          {chipData && (
            <div className="mt-8 text-left border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800 p-3 border-b border-gray-200 dark:border-slate-700 font-bold text-gray-700 dark:text-slate-300">
                Çip İçeriği (NDEF Kayıtları)
              </div>
              <div className="p-4 space-y-4 bg-white dark:bg-[#0F172A]">
                {chipData.map((rec, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-xs font-bold uppercase text-gray-400">Kayıt Tipi: {rec.type}</div>
                    <div className="font-mono text-sm break-all bg-gray-100 dark:bg-slate-900 p-2 rounded text-blue-600 dark:text-blue-400">
                      {rec.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'write' && (
        <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-2xl p-8 md:p-12 text-center shadow-sm max-w-xl mx-auto">
          <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className={`w-10 h-10 ${isScanning ? 'text-purple-600 animate-pulse' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Kart Kodlama (Yazma) Aracı
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mt-2 mb-6">
            Sistemde ürettiğiniz bir kartın seri numarasını girin ve ilgili URL'yi fiziksel karta doğrudan telefonunuzdan yazın. (NFC Tools kullanımına alternatif)
          </p>

          {/* Kodlama Modu Seçimi */}
          <div className="mb-6 flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl max-w-xl mx-auto">
            <button 
              onClick={() => setWriteMode('auto')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${writeMode === 'auto' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}
            >
              Sistem (Otomatik Link)
            </button>
            <button 
              onClick={() => setWriteMode('manual')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${writeMode === 'manual' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}
            >
              Manuel Veri Kodlama
            </button>
          </div>

          {/* Manuel Kodlama Alanı */}
          {writeMode === 'manual' && (
            <div className="mb-6 text-left max-w-xl mx-auto space-y-4 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Kayıt Tipi</label>
                <select 
                  value={manualPayloadType} 
                  onChange={(e) => setManualPayloadType(e.target.value as 'url' | 'text')}
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="url">URL (Web Linki)</option>
                  <option value="text">Düz Metin (Text)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">İçerik</label>
                <textarea 
                  value={manualPayloadContent}
                  onChange={(e) => setManualPayloadContent(e.target.value)}
                  placeholder={manualPayloadType === 'url' ? 'https://ornek.com' : 'Kartın içine yazılacak metin...'}
                  rows={3}
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Her zaman görünür kilit seçeneği */}
          <div className="mb-6 flex items-start gap-3 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/30 text-left max-w-xl mx-auto">
            <input 
              type="checkbox" 
              id="lock-checkbox"
              checked={shouldLock}
              onChange={(e) => setShouldLock(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="lock-checkbox" className="text-sm text-red-800 dark:text-red-400 font-medium cursor-pointer">
              <span className="block font-bold">Kalıcı Şifreleme (Donanımsal Kilitleme)</span>
              <span className="block font-normal mt-1 opacity-90">Seçilirse kart sonsuza kadar kilitlenir. İxaretlemezseniz kart <b>düzenlenebilir olarak bırakılır</b> ve içeriği daha sonra değixtirilebilir.</span>
            </label>
          </div>

          {writeMode === 'auto' && !writePreview && !writeSuccess && writeSerial && (
            <div className="mt-6 text-left border border-purple-200 dark:border-purple-900/50 rounded-xl overflow-hidden mb-6 max-w-full shadow-sm">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 border-b border-purple-200 dark:border-purple-900/50 flex justify-center items-center">
                <span className="font-bold text-purple-800 dark:text-purple-300 text-lg">
                  Sıradaki Karta Atanacak Numara: {writeSerial}
                </span>
              </div>
            </div>
          )}
          
          {writeMode === 'auto' && !writeSerial && !writeSuccess && (
            <div className="text-gray-500 font-medium py-8 animate-pulse">
              Sıradaki numara kontrol ediliyor...
            </div>
          )}

          {writePreview && (
            <div className="mt-6 text-left border border-purple-200 dark:border-purple-900/50 rounded-xl overflow-hidden mb-6 max-w-full shadow-sm">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 border-b border-purple-200 dark:border-purple-900/50 flex justify-between items-center">
                <span className="font-bold text-purple-800 dark:text-purple-300">
                  Sıradaki Karta Yüklenecek Veri
                </span>
                <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-purple-600 border border-purple-200 dark:border-purple-700">
                  Kart No: {writePreview.id}
                </span>
              </div>
              <div className="p-4 bg-white dark:bg-[#0F172A] space-y-2 max-w-full overflow-hidden">
                <div className="font-mono text-sm md:text-base break-words whitespace-pre-wrap bg-gray-100 dark:bg-slate-900 p-4 rounded-lg text-purple-600 dark:text-purple-400 border border-gray-200 dark:border-slate-700 w-full overflow-x-hidden">
                  {writePreview.url}
                </div>
              </div>
            </div>
          )}

          {scanError && (
            <div className="mt-4 mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium">
              {scanError}
            </div>
          )}

          {writeSuccess && (
            <div className="mt-4 mb-4 space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl text-green-700 dark:text-green-400 text-sm font-bold flex flex-col items-center justify-center gap-2">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                İxlem Baxarılı! URL Karta Yazıldı.
              </div>
              <button 
                onClick={() => {
                  setWriteSuccess(false);
                  setWritePreview(null);
                  fetchNextSerial(); // Yeni kart numarasını getir
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-md w-full"
              >
                Sonraki Karta Geç (Yeni URL Üret)
              </button>
            </div>
          )}

          {!isScanning && !writeSuccess && (
            <button 
              onClick={startWrite}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-xl shadow-purple-500/30 w-full animate-pulse text-lg"
            >
              Karta Yaz (Kartı Okut)
            </button>
          )}

          {isScanning && (
            <div className="text-purple-600 dark:text-purple-400 font-bold animate-pulse">
              Yazma modu aktif... Lütfen fiziksel kartı telefonunuza yaklaxtırın ve bekleyin.
            </div>
          )}
        </div>
      )}

      {/* Modal - Kart okunduğunda çıkar */}
      {scannedId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-transparent dark:border-[#1E293B]">
            <button 
              onClick={() => window.location.href = '/super-admin/nfc/checker'}
              className="absolute top-4 right-4 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              Kapat
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sistem Kayıt Bilgisi</h3>
            
            {loading ? (
              <div className="py-8 text-center text-gray-500 dark:text-slate-400">Veritabanından çekiliyor...</div>
            ) : cardStatus ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-[#1E293B]">
                  <span className="text-gray-500 dark:text-slate-400">Kart Numarası</span>
                  <span className="font-mono font-bold text-lg dark:text-white">{cardStatus.id}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-[#1E293B]">
                  <span className="text-gray-500 dark:text-slate-400">Kategori</span>
                  <span className="font-medium text-gray-900 dark:text-white">{cardStatus.type}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-[#1E293B]">
                  <span className="text-gray-500 dark:text-slate-400">Atama Durumu</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 rounded-full text-xs font-bold">
                    {cardStatus.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500 dark:text-slate-400">Sistem İzni</span>
                  <span className={`font-bold ${cardStatus.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {cardStatus.isActive ? 'Açık (Aktif)' : 'Kapalı (İptal Edilmix)'}
                  </span>
                </div>
                
                <div className="mt-8">
                  <button 
                    onClick={() => window.location.href = '/super-admin/nfc/checker'}
                    className="w-full bg-gray-900 dark:bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-blue-500 transition-colors"
                  >
                    Yeni Bir Kart Daha Sorgula
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Neden Uygulama Modal */}
      {showWhyAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl max-w-lg w-full relative border border-gray-100 dark:border-[#1E293B] overflow-hidden flex flex-col max-h-[90vh] animate-[pulse_0.5s_ease-out_1]">
            {/* Header / Banner Area */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-center relative overflow-hidden flex-shrink-0">
              {/* Dekoratif Daireler */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              
              <button 
                onClick={() => setShowWhyAppModal(false)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg className="w-10 h-10 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1 drop-shadow-sm">Neden Uygulama?</h3>
              <p className="text-blue-100 font-medium text-sm">Apple & Android Cihazlardaki NFC Farkları</p>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 bg-white dark:bg-[#0F172A] overflow-y-auto">
              {/* Detaylar */}
              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                    <strong>İxletim Sistemi Sınırları:</strong> Apple (iOS) ekosistemi ve web tarayıcıları, güvenlik kuralları gereği NFC çiplerinin donanım çekirdeğine dıxarıdan <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600 dark:text-pink-400 font-bold mx-1">PWD_AUTH</code> xifresi gönderilmesine (yani kartın kilitlenmesine) izin vermezler.
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-green-50/50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-800/30">
                  <div className="mt-1 bg-green-100 dark:bg-green-900 p-1.5 rounded-lg text-green-600 dark:text-green-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.95 11.95 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                    <strong>Neden Android Native APK?:</strong> Kartlarınızı kopyalanmaya karxı <strong>donanımsal olarak kilitlemek</strong> için alt seviye Android kütüphanelerine ihtiyacımız var. (Apple kullanıcıları web'den profilini her zaman güncelleyebilir, sadece fiziksel kitleme yapamazlar).
                  </div>
                </div>
              </div>

              {/* Alternatif Seçenek (Uygulama İndirmek İstemeyenler İçin) */}
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white dark:bg-[#0F172A] text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Alternatif Çözüm
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Hiçbir xey indirmek istemiyor musunuz?
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                  Apple (iPhone) kullanıyorsanız veya APK kurmakla uğraxmak istemiyorsanız, <strong>hiç sorun değil!</strong> Siparix verirken kartlarınızın sistem merkezimizde kalıcı olarak kilitlenip size doğrudan donanımsal korumayla gelmesini sağlayabilirsiniz. (Kartınız kilitli olsa bile profil bilgilerinizi web sitenizden sınırsızca değixtirebilirsiniz).
                </p>
              </div>

              <button 
                onClick={() => setShowWhyAppModal(false)}
                className="mt-6 w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Suspense } from 'react';

export default function CardCheckerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
      <CardCheckerContent />
    </Suspense>
  );
}
