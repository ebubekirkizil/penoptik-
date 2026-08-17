import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
          </Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground">KVKK ve Gizlilik Politikası</h1>
        </div>
        
        <article className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p>Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
          
          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Taraflar ve Amaç</h2>
          <p>
            Bu Gizlilik Politikası, Pen Optik (bundan böyle "Şirket" olarak anılacaktır) tarafından yönetilen sistemlerin ve web sitesinin (bundan böyle "Sistem" olarak anılacaktır) kullanımı sırasında kullanıcıların ve müşterilerin (bundan böyle "Kullanıcı" olarak anılacaktır) kişisel verilerinin Türkiye Cumhuriyeti 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca toplanması, işlenmesi ve korunmasına ilişkin esasları düzenler.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Toplanan Veriler</h2>
          <p>
            Şirketimiz, kullanıcılara hizmet sunabilmek ve optik/lens siparişlerini yönetebilmek amacıyla aşağıdaki verileri toplayabilir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kimlik Bilgileri: Ad, soyad, TC kimlik numarası (reçete işlemleri için zorunlu hallerde).</li>
            <li>İletişim Bilgileri: Telefon numarası, adres, e-posta adresi.</li>
            <li>Sağlık Bilgileri: Göz doktoru reçeteleri, gözlük/lens ölçümleri (Sferik, Silindirik, Aks, PD ölçümleri vb.) ve ilgili sağlık kuruluşunun bilgileri.</li>
            <li>İşlem Bilgileri: Geçmiş siparişler, ödeme tutarları, bakiye bilgileri.</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Verilerin İşlenme Amacı</h2>
          <p>
            Toplanan kişisel verileriniz ve sağlık verileriniz, tamamen size özel üretilecek olan optik ürünlerin (gözlük, lens vb.) doğru bir şekilde hazırlanması, teslimatı, geçmiş ölçümlerinizin takibi, müşteri destek hizmetlerinin sunulması ve yasal yükümlülüklerimizin (fatura kesimi, SGK işlemleri vb.) yerine getirilmesi amacıyla işlenmektedir.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Verilerin Aktarımı</h2>
          <p>
            Kişisel verileriniz, kesinlikle ticari amaçlarla üçüncü şahıslara satılmaz veya kiralanmaz. Ancak yasal gereklilikler (SGK onayları vb.) kapsamında yetkili kamu kurum ve kuruluşları ile, sistem altyapısının sürdürülebilmesi için veri güvenliği sertifikalarına sahip sunucu sağlayıcılarımızla paylaşılabilir. Sesli asistan kullanımı halinde şifreli veri işleme amacıyla yurtdışı altyapı sağlayıcılarına aktarım yapılabilir.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Veri Güvenliği</h2>
          <p>
            Şirket, kişisel verilerinizin yetkisiz erişim, kayıp, kullanım ve değiştirilmesini engellemek için endüstri standardı güvenlik önlemleri (SSL şifreleme, güvenlik duvarları, veri şifreleme) uygular. Tüm verileriniz güvenli sunucularda saklanmaktadır.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">6. Kullanıcı Hakları (KVKK Madde 11)</h2>
          <p>
            KVKK kapsamında kullanıcılar; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde / yurt dışında aktarıldığı 3. kişileri bilme, eksik / yanlış işlenmişse düzeltilmesini isteme haklarına sahiptir.
          </p>
          <p>
            Bu haklarınızı kullanmak için iletişim numaralarımızdan veya mağazamız üzerinden bizimle iletişime geçebilirsiniz.
          </p>
        </article>
      </main>
    </div>
  );
}
