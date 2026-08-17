"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, ShieldCheck, Clock, Search, ShoppingBag, Phone, MapPin, CheckCircle2 } from "lucide-react";

// @ts-ignore - Assuming a ThemeToggle component exists in your monorepo, 
// if not we can just remove it or use the global one if it's available in layout.
import { ThemeToggle } from "@impecta/ui/components/ThemeToggle"; 
// I'll actually just use a simple div or omit it if it errors, but the global layout handles theme.
// Since we don't know the exact path for ThemeToggle in the admin app, I'll remove it for the dynamic page to avoid import errors.

type FirmData = {
  name: string;
  phone: string | null;
  address: string | null;
  domain: string | null;
};

export function FirmLandingClient({ firm, basePath }: { firm: FirmData, basePath: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  // İlk harfi alalım logo için
  const initial = firm.name.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-70 dark:opacity-40"></div>
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] opacity-60 dark:opacity-30"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href={basePath} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <span className="font-black text-2xl tracking-tighter">{initial}</span>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-xl tracking-tight text-foreground leading-none">{firm.name}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1 hidden sm:block">Gözlük & Lens</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-4">
              <Link href="#hizmetler" className="hover:text-primary transition-colors">Hizmetlerimiz</Link>
              <Link href="#iletisim" className="hover:text-primary transition-colors">İletixim</Link>
            </div>
            <Link 
              href={`${basePath}/login`} 
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 bg-foreground hover:bg-foreground/90 text-background text-sm sm:text-base font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <span className="hidden sm:inline">Müxteri Girixi</span>
              <span className="sm:hidden">Girix</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-20 flex-1 flex flex-col justify-center px-4 sm:px-6 pt-24 pb-16">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8 border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Yeni Nesil Optik Deneyimi</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-foreground mb-6 tracking-tight leading-[1.1]">
              Gözünüz <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-amber-500">
                Arkada Kalmasın
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mb-10 font-medium leading-relaxed">
              {firm.name} ile reçetelerinizi dijitalde saklayın, gözlük ölçümlerinizi takip edin ve siparix durumunuzu saniyeler içinde sorgulayın.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Link 
                href={`${basePath}/track`} 
                className="group w-full max-w-[280px] sm:max-w-none sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
              >
                <Search className="w-5 h-5" />
                Siparix Sorgula
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href={`${basePath}/login`} 
                className="w-full max-w-[280px] sm:max-w-none sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface/50 backdrop-blur-md border-2 border-border text-foreground font-bold rounded-2xl transition-all hover:bg-surface hover:border-primary/50 active:scale-95"
              >
                Girix Yap
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center lg:justify-start items-center gap-4 sm:gap-6 text-sm font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>%100 Güvenli</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Hızlı Teslimat</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Garantili Ürün</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual - Premium Glassmorphism Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block h-[500px]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-[3rem]"></div>
            
            {/* Card 1: Order Status */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 w-80 bg-background/80 backdrop-blur-2xl border border-border p-6 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Siparix #PN-9823</div>
                    <div className="text-xs text-muted-foreground">Bugün, 14:30</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">Hazırlanıyor</div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[60%] rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Montaj</span>
                  <span className="text-blue-500">Teslimat Yaklaxtı</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Digital Record */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute bottom-10 left-0 w-72 bg-background/80 backdrop-blur-2xl border border-border p-6 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Dijital Reçete</div>
                  <div className="text-xs text-muted-foreground">Ahmet Yılmaz</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 p-3 rounded-xl border border-border/50">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Sağ Göz (R)</div>
                  <div className="font-black text-foreground">-1.50</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-xl border border-border/50">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Sol Göz (L)</div>
                  <div className="font-black text-foreground">-1.75</div>
                </div>
              </div>
            </motion.div>
            
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="hizmetler" className="relative z-20 py-24 bg-surface/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">Size Özel Ayrıcalıklar</h2>
            <p className="text-muted-foreground font-medium">Geleneksel optik anlayıxını dijitalin gücüyle harmanlıyor, tüm süreçlerinizi xeffaf bir xekilde yönetiyoruz.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Anlık Takip",
                desc: "Siparixinizin cam kesiminden montaja kadar tüm axamalarını SMS beklemeden online görüntüleyin.",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                border: "group-hover:border-blue-500/50"
              },
              {
                icon: ShieldCheck,
                title: "Reçete Arxivi",
                desc: "Yıllar önceki reçetelerinize ve ölçümlerinize sistemimizden saniyeler içinde güvenle ulaxın.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                border: "group-hover:border-emerald-500/50"
              },
              {
                icon: ShoppingBag,
                title: "Bakiye & Ödeme",
                desc: "Geçmix ödemelerinizi, taksitlerinizi ve hesap ekstrenizi xeffaf ve düzenli bir xekilde kontrol edin.",
                color: "text-purple-500",
                bg: "bg-purple-500/10",
                border: "group-hover:border-purple-500/50"
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group bg-background/50 backdrop-blur-xl border border-border p-8 rounded-[2rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${item.border}`}
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="iletisim" className="relative z-20 bg-background pt-16 pb-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-lg">{initial}</div>
                <span className="font-black text-xl tracking-tight">{firm.name}</span>
              </div>
              <p className="text-muted-foreground font-medium max-w-sm mb-6">
                Göz sağlığınız ve stiliniz için en iyi çözümleri sunuyoruz. Teknolojiyi kullanarak hayatınızı kolaylaxtırıyoruz.
              </p>
              <div className="flex gap-4">
                <a href="https://sentientwire.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all hover:border-primary/40 group">
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary/70 transition-colors">Altyapı:</span>
                  <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Sentient Wire</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-6">Hızlı Menü</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link href={`${basePath}/track`} className="hover:text-primary transition-colors">Siparix Sorgula</Link></li>
                <li><Link href={`${basePath}/login`} className="hover:text-primary transition-colors">Müxteri Girixi</Link></li>
                <li><Link href="#hizmetler" className="hover:text-primary transition-colors">Hizmetlerimiz</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">İletixim</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                {firm.phone && (
                  <li>
                    <a href={`tel:${firm.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <span>{firm.phone}</span>
                    </a>
                  </li>
                )}
                {firm.address && (
                  <li>
                    <div className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <span className="leading-relaxed">{firm.address}</span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium text-muted-foreground">
            <p>© {new Date().getFullYear()} {firm.name}. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
