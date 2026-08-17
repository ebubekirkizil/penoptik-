import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import React from "react";

export default function TermsOfServicePage() {
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
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground">Kullanım Koşulları</h1>
        </div>
        
        <article className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p>Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
          
          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Giriş</h2>
          <p>
            Bu Kullanım Koşulları sözleşmesi, Pen Optik ("Şirket") tarafından sunulan web sitesi ve dijital sistemlerin ("Sistem") kullanım şartlarını düzenlemektedir. Sisteme erişim sağlayarak veya kullanarak, bu Kullanım Koşulları'nı okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Hizmetlerin Tanımı</h2>
          <p>
            Pen Optik, kullanıcılarına sipariş takibi, dijital reçete arşivleme, bakiye görüntüleme ve müşteri bilgilendirme hizmetleri sunar. Sunulan hizmetler, kullanıcının göz sağlığı ve optik ürün ihtiyaçlarının daha verimli yönetilmesini amaçlamaktadır.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Kullanıcı Yükümlülükleri</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kullanıcı, sisteme üye olurken verdiği tüm bilgilerin doğru ve güncel olduğunu kabul eder.</li>
            <li>Sistem giriş bilgilerinin (şifre vb.) güvenliğinden kullanıcı bizzat sorumludur. Hesabınız üzerinden yapılan işlemlerden doğabilecek tüm yasal sorumluluklar size aittir.</li>
            <li>Kullanıcı, sistemi hukuka aykırı amaçlarla veya başkalarının haklarını ihlal edecek şekilde kullanamaz.</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Reçete ve Sipariş Sorumluluğu</h2>
          <p>
            Sistemde yer alan numaralar ve göz ölçümleri, yetkili hekimler tarafından verilen reçetelere dayanmaktadır. Kullanıcı, sistemde saklanan veya iletilen reçete bilgilerinin doğru olduğunu teyit etmekle yükümlüdür. Şirket, kullanıcı tarafından hatalı veya eksik iletilen bilgilerden doğabilecek sorunlardan sorumlu tutulamaz.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Fikri Mülkiyet Hakları</h2>
          <p>
            Sistemde yer alan tüm metinler, grafikler, logolar, yazılım kodları ve tasarımlar Pen Optik'e veya altyapı sağlayıcısına aittir. Bu içerikler, izin alınmaksızın kopyalanamaz, çoğaltılamaz ve ticari amaçla kullanılamaz.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">6. Sözleşme Değişiklikleri</h2>
          <p>
            Şirket, yasal veya operasyonel zorunluluklar doğrultusunda bu kullanım koşullarında önceden haber vermeksizin değişiklik yapma hakkını saklı tutar. Yapılan değişiklikler sistemde yayınlandığı andan itibaren geçerli olur.
          </p>
        </article>
      </main>
    </div>
  );
}
