# AI Tasarım ve Otomasyon Rehberi (Stil Anayasası)

Bu belge, yapay zekanın (AI) projelerdeki tasarım ve animasyon kararlarını kendi başına, hızlı ve hatasız alabilmesi için kurgulanmış bir **otomasyon sistemidir**. Kütüphanelerin birbirine karışmasını engeller ve AI'ın hangi senaryoda hangi kütüphaneyi seçeceğini kesin kurallara bağlar.

## 1. Kütüphane Görev Dağılımı (Çakışma Önleyici Sistem)

7 farklı UI/Animasyon kütüphanesinin birbiriyle çakışmaması için her birinin tek bir uzmanlık alanı (görevi) vardır:

1. **[Shadcn UI](https://ui.shadcn.com/) (İSKELET & CORE UI):** 
   - **Kullanım Yeri:** Butonlar, formlar, tablolar, diyaloglar (modals), dropdown'lar, veri giriş alanları.
   - **Kural:** Sistemdeki tüm temel UI bileşenleri İSTİSNASIZ Shadcn UI ile oluşturulacaktır. Başka bir kütüphaneden standart buton/input alınmayacaktır.

2. **[Aceternity UI](https://ui.aceternity.com/) (VİTRİN & WOW ETKİSİ):** 
   - **Kullanım Yeri:** Müşteri tarafındaki (E-ticaret) Hero alanları (açılış ekranları), 3D ürün kartları, parlayan arka planlar (Aurora, Sparkles), landing page geçişleri.
   - **Kural:** Yalnızca dikkati çekmesi gereken büyük, görsel bileşenlerde kullanılacaktır. Yönetim panelinde (Admin) kesinlikle kullanılmaz.

3. **[Magic UI](https://magicui.design/) (MODERN BİLEŞENLER & BENTO):** 
   - **Kullanım Yeri:** Dashboard (Yönetim paneli) özet ekranlarındaki "Bento Grid" dizilimleri, istatistik kartları, kayan bildirimler (marquee), retro arka planlar.
   - **Kural:** Bilgiyi şık bir şekilde listelemek ve sunmak için tercih edilecektir.

4. **[React Bits](https://www.reactbits.dev/) (METİN & ARKA PLAN EFEKTLERİ):** 
   - **Kullanım Yeri:** Dinamik metin efektleri (yazılırken değişen metinler), dikkat çekici başlıklar.

5. **[Motion.dev](https://motion.dev/) (MİKRO ETKİLEŞİM & SAYFA GEÇİŞİ):** 
   - **Kullanım Yeri:** Menü açılışları, sayfa içi bileşenlerin sırayla ekrana gelmesi (staggered fade-in), hover durumlarındaki esnek (spring) tepkiler.
   - **Kural:** React (Next.js) state'lerine bağlı tüm durum değişikliklerinde varsayılan animasyon motoru olarak kullanılacaktır.

6. **[GSAP](https://gsap.com/) (SCROLL & ZAMAN ÇİZELGESİ):** 
   - **Kullanım Yeri:** Kullanıcı sayfayı aşağı kaydırdıkça (scroll) tetiklenen karmaşık animasyonlar ve birbirine bağlı zincirleme (timeline) hareketler.
   - **Kural:** Motion.dev'in yetersiz kaldığı ağır scroll işlemlerinde devreye girecektir.

7. **[Anime.js](https://animejs.com/) (SPESİFİK & HAFİF DOM):** 
   - **Kullanım Yeri:** SVG çizim animasyonları (çizgi çizdirme), parçacık (particle) efektleri.

---

## 2. Senaryo Bazlı Karar Otomasyonu (AI Execution Flow)

Yapay zeka, yeni bir sayfa veya bileşen istendiğinde aşağıdaki karar ağacını (decision tree) otomatik uygulayacaktır:

### Senaryo A: Yönetim Paneli (Admin / Dashboard) Yapılıyor
- **Öncelik:** Hız, verimlilik, okunabilirlik.
- **Kullanılacaklar:**
  1. Çatı ve Formlar: **Shadcn UI**
  2. İstatistik Gösterimi ve Kartlar: **Magic UI** (Bento Grid stili)
  3. Açılış/Kapanış Animasyonları: **Motion.dev** (Hafif ve hızlı fade-in)
- **Yasaklılar:** Aceternity UI, GSAP (Yönetim panelinde yorucu efektler siteyi yavaşlatır).

### Senaryo B: E-Ticaret / Müşteri Vitrini (B2C) Yapılıyor
- **Öncelik:** Etkileyicilik (Wow effect), modern hissiyat, satışa dönüşüm.
- **Kullanılacaklar:**
  1. Açılış Ekranı (Hero): **Aceternity UI** (Örn: Typewriter effect, Aurora background)
  2. Ürün Kartları: **Aceternity UI** (3D Pin veya Hover Card)
  3. Sepet ve Ödeme (Form/UI): **Shadcn UI**
  4. Müşteri İncelemeleri (Reviews): **Magic UI** (Marquee - Kayan bant)
  5. Scroll Edildikçe Açılan Bölümler: **GSAP (ScrollTrigger)** veya **Motion.dev**

---

## 3. Yapay Zeka Uygulama Talimatları (AI Instruction Set)

Kullanıcı "Bana bir sayfa yap", "Tasarımı düzelt" veya "Şu modülü kodla" dediğinde AI şu sırayı takip edecektir:

1. **İhtiyacı Belirle:** İstenen sayfa Admin mi, Müşteri mi?
2. **Rehbere Başvur:** Bu belgedeki 2. Madde (Senaryo) kurallarını referans al.
3. **Kodu Çek & Uyarla:** Kütüphanenin dokümantasyonuna veya sisteme yüklenmiş `skills.sh` eğitim dosyalarına bakarak ilgili komponenti doğrudan projeye entegre et.
4. **Stilleri Birleştir:** Komponenti projeye eklerken Tailwind renklerini (örn: `bg-primary`, `text-foreground`) projenin global CSS tema değişkenleriyle %100 uyumlu hale getir. Sabit renk (örn: `bg-blue-500`) kullanma, uyumu bozma.
5. **Optimize Et:** Animasyonların üst üste binip siteyi yavaşlatmaması veya DOM ağacını şişirmemesi için kütüphanelerin birbiriyle çakışmadığından emin ol.

**YAPAY ZEKA (AI) İÇİN KESİN KURAL:** 
Bu belge senin anayasan. Tasarım yaparken asla sıradan HTML/Tailwind kodlarıyla basit işler çıkarma. Her zaman bu rehberdeki görev dağılımına en uygun kütüphaneyi seç ve o kütüphanenin profesyonel bileşenini koda aktar. Kullanıcının sana ekstra kütüphane adı vermesine veya "Şunu kullan" demesine gerek kalmadan, **bu otomasyon mantığıyla otonom kararlar al!**
