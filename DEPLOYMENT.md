# 🚀 Vercel Deployment Talimatları

## Monorepo Yapılandırması

Bu proje bir **Monorepo** (Turborepo) yapısındadır. Vercel'de deployment yapabilmek için aşağıdaki adımları takip edin:

### 1. Vercel Dashboard Ayarları

1. **Vercel Dashboard**'a gidin: https://vercel.com/dashboard
2. Projenizi seçin: **optisyen**
3. **Settings** → **General** bölümüne gidin

### 2. Root Directory Ayarı

**Root Directory** kısmını şu şekilde ayarlayın:
```
apps/mega-admin
```

### 3. Build & Development Settings

**Framework Preset:** Next.js

**Build Command:**
```bash
cd ../.. && cd packages/database && npx prisma generate && cd ../.. && npx turbo build --filter=mega-admin
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

### 4. Environment Variables

Aşağıdaki environment variable'ları ekleyin:

```env
DATABASE_URL=your_database_url_here
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 5. Deploy

Settings kayıt edildikten sonra:

```bash
vercel --prod
```

veya Vercel Dashboard'dan **"Redeploy"** butonuna tıklayın.

## 🎉 Deploy Sonrası

Dashboard sayfası şu özelliklere sahip:

✅ Modern, premium glassmorphism tasarım  
✅ Responsive (mobil, tablet, desktop)  
✅ Real-time istatistikler  
✅ Animasyonlu kartlar ve hover efektleri  
✅ Sipariş durumu görünümü  
✅ Finansal ve müşteri grafikleri  
✅ Bekleyen doğrulama bildirimleri  
✅ Hızlı işlem butonları  

## 📊 Özellikler

- **Canlı Veriler:** Veritabanından gerçek zamanlı çekilen veriler
- **İstatistikler:** Bugünkü ve aylık ciro, toplam müşteri, sipariş sayıları
- **Grafikler:** Finansal trend ve müşteri büyüme grafikleri
- **Hızlı Erişim:** Tek tıkla yeni müşteri, sipariş ekleme
- **Durum Takibi:** Sipariş durumlarının anlık gösterimi

---

**Not:** Türkçe karakter sorunu nedeniyle klasör ismi `İMPECTA` yerine `IMPECTA` olarak kullanılmalıdır.
