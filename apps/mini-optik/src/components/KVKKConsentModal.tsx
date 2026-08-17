"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

export function KVKKConsentModal() {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Oturum (session) bazlı kontrol yapalım
    // Eğer tarayıcıda (sessionStorage) kvkk_accepted yoksa modalı göster
    const isAccepted = sessionStorage.getItem("kvkk_accepted");
    if (!isAccepted) {
      setShowModal(true);
    }
  }, []);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    
    // Eğer en alta kadar (10px hata payı ile) kaydırdıysa aktif et
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  const handleConfirm = async () => {
    if (!isChecked) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/kvkk-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentVersion: "v1.0" }),
      });

      if (!res.ok) {
        throw new Error("Onay kaydedilirken bir hata oluştu.");
      }

      sessionStorage.setItem("kvkk_accepted", "true");
      setShowModal(false);
      toast.success("KVKK Aydınlatma Metni dijital olarak onaylandı.");
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-surface border border-border-color shadow-2xl rounded-2xl w-[95%] sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-border-color shrink-0">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-foreground">KVKK Aydınlatma, Açık Rıza ve Sorumluluk Beyanı</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Yasal zorunluluk gereği sisteme giriş yapabilmek için tüm metni okuyup onaylamanız gerekmektedir.</p>
          </div>
        </div>

        {/* Content (Scrollable) */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-[13px] sm:text-sm text-muted-foreground custom-scrollbar bg-background/50 leading-relaxed text-justify"
        >
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 mb-6 shrink-0">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <p className="font-bold">
              DİKKAT: İşbu sözleşmeyi onayladığınızda, sisteme girdiğiniz tüm müşteri/hasta verilerinin hukuki ve cezai sorumluluğunu şahsınız ve firmanız adına gayrikabili rücu (geri dönülemez) şekilde üzerinize almış olursunuz.
            </p>
          </div>

          <div>
            <h3 className="font-black text-foreground text-sm sm:text-base border-b border-border-color pb-1 mb-2">1. VERİ SORUMLUSUNUN KİMLİĞİ VE HUKUKİ YÜKÜMLÜLÜKLER</h3>
            <p>
              İşbu bulut tabanlı yazılım altyapısı, yalnızca teknik bir veri depolama ve işleme aracı (Veri İşleyen) olarak hizmet vermektedir. Sisteme girilen reçete, kimlik, iletişim ve her türlü sağlık/kişisel verinin "Veri Sorumlusu", 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında doğrudan doğruya sisteme veri girişini yapan Optisyenlik Müessesesi, firma yetkilisi ve oturumu açan personelin kendisidir. Yazılım sağlayıcı firma, girilen verilerin doğruluğundan, kaynağında rıza alınıp alınmadığından sorumlu tutulamaz.
            </p>
          </div>
          
          <div>
            <h3 className="font-black text-foreground text-sm sm:text-base border-b border-border-color pb-1 mb-2">2. ÜÇÜNCÜ TARAF YAZILIMLAR VE YAPAY ZEKA KULLANIMI</h3>
            <p>
              Sistem dahilinde sunulan "Yapay Zeka Destekli Sesli Asistan", "Görsel Reçete Okuyucu" ve benzeri otomasyon modülleri kullanıldığında; mikrofondan dikte edilen isim, soyisim, telefon numaraları ve yüklenen reçete fotoğrafları, veriyi anlık olarak işlemek, ayrıştırmak ve metne dökmek amacıyla üçüncü taraf (Google Cloud, Gemini AI vb.) bulut bilişim hizmetlerine şifreli olarak iletilmektedir. Sisteme veri giren kullanıcı (personel/optisyen), ilgili hastalardan/müşterilerden bu tür yurtiçi ve yurtdışı veri aktarımları için KVKK Madde 9 ve ilgili diğer mevzuatlar kapsamında açık ve yazılı rıza (Açık Rıza) aldığını kabul, beyan ve taahhüt eder. Rıza alınmaksızın yapılan veri girişlerinden doğacak tüm idari para cezaları ve tazminatlar veri girişini yapan kullanıcıya aittir.
            </p>
          </div>

          <div>
            <h3 className="font-black text-foreground text-sm sm:text-base border-b border-border-color pb-1 mb-2">3. VERİLERİN İZİNSİZ KULLANIMI, SATIŞI VE PAYLAŞILMASI YASAĞI</h3>
            <p>
              Sisteme kaydedilen hiçbir müşteri/hasta verisi (telefon numarası, isim, reçete detayları vb.); hastanın açık rızası olmaksızın pazarlama mesajı (SMS/WhatsApp) atmak, üçüncü şahıs ve kurumlara satmak, devretmek, kiralamak, ticari veya kişisel menfaat sağlamak amacıyla KESİNLİKLE kullanılamaz. Kullanıcı, sistemdeki verileri kopyalayarak yetkisi dışındaki ortamlara (yerel diskler, taşınabilir bellekler, bulut depolama servisleri) aktaramaz. Bu tür eylemlerin tespiti halinde veya üçüncü şahıslardan/kurumlardan (KVKK Kurumu, Savcılık vb.) gelecek şikayet ve yaptırımlarda, yazılım firması (SentientWire / Hizmet Sağlayıcı) hiçbir koşulda hukuki, cezai veya maddi/manevi tazminat sorumluluğu kabul etmez. Tüm sorumluluk (para cezaları ve hapis cezaları dahil) münhasıran eylemi gerçekleştiren kullanıcıya ve bağlı olduğu kuruma aittir.
            </p>
          </div>

          <div>
            <h3 className="font-black text-foreground text-sm sm:text-base border-b border-border-color pb-1 mb-2">4. ŞİFRELEME (ENCRYPTION) VE GÜVENLİK</h3>
            <p>
              Sistem veritabanında müşterilere ait kritik veriler (İsim, Soyisim, Telefon No, T.C. Kimlik No vb.) doğrudan açık metin (plain text) olarak saklanmaz. Veriler gelişmiş şifreleme (AES-256 vb.) algoritmaları ile kör indeksleme (blind indexing) teknikleri kullanılarak muhafaza edilir. Ancak kullanıcının kendi hesap şifresini çaldırması, şifresini üçüncü kişilerle paylaşması veya açık bırakılan bir oturum üzerinden verilerin sızdırılması durumunda yazılım firması sorumlu tutulamaz. Kullanıcı, kendi hesap güvenliğini sağlamakla mükelleftir.
            </p>
          </div>

          <div>
            <h3 className="font-black text-foreground text-sm sm:text-base border-b border-border-color pb-1 mb-2">5. DİJİTAL İMZA, LOGLAMA VE KANIT NİTELİĞİ</h3>
            <p>
              İşbu onay kutucuğunu işaretleyerek "Onayla ve Giriş Yap" butonuna bastığınız an; sisteme giriş yaptığınız kesin tarih, saat, donanım kimliğiniz, işletim sisteminiz, tarayıcı türünüz ve IP adresiniz 5651 sayılı kanun ve ilgili mevzuatlar çerçevesinde "Dijital Onay ve İmza" niteliğinde loglanarak (kayıt altına alınarak) değiştirilemez şekilde saklanacaktır. Bu kayıtlar, ihtilaf vukuunda Türkiye Cumhuriyeti Mahkemeleri ve KVKK Kurumu nezdinde kesin ve münhasır delil (HMK md. 193) niteliği taşıyacaktır.
            </p>
          </div>
          
          <div className="h-6"></div>
          <div className="flex items-center justify-center p-3 bg-primary/10 rounded-xl border-2 border-primary/20 animate-pulse">
            <p className="text-center text-xs sm:text-sm text-primary font-bold">Lütfen onaylamak için metnin sonuna kadar kaydırınız ↓</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border-color bg-surface/50 space-y-4">
          <label className={`flex items-start gap-3 cursor-pointer ${!hasScrolledToBottom ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center h-5 mt-0.5">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="w-5 h-5 rounded border-border-color text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
              />
            </div>
            <div className="text-sm">
              <p className={`font-medium ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>
                KVKK Aydınlatma ve Açık Rıza Metni'ni okudum, anladım ve kabul ediyorum. Müşteri verilerini girmeye yetkili olduğumu beyan ederim.
              </p>
            </div>
          </label>

          <button
            onClick={handleConfirm}
            disabled={!isChecked || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                DİJİTAL OLARAK ONAYLA VE GİRİŞ YAP
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
