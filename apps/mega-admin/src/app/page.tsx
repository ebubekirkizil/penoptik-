"use client";

import { Building2, TrendingUp, Users, DollarSign, ArrowUpRight, Activity, Server, Clock, HardDrive, ShieldAlert, Zap, Box, CheckCircle2, Database, Receipt, Truck, ShoppingBag, Store, ArrowRight, Lock, Package, Shield, Globe } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { AdminDemo } from "@/components/landing/AdminDemo";
import { PricingSection } from "@/components/landing/PricingSection";
import { AutomationSchema } from "@/components/landing/AutomationSchema";
import Image from "next/image";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { LandingHeader } from "@/components/LandingHeader";

export default function SentientWireLanding() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020202] text-slate-900 dark:text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden font-sans">
      {/* Background System */}
      <InteractiveBackground />

      {/* Shared Landing Header with Mobile Drawer */}
      <LandingHeader
        navLinks={[
          { href: "#surec", label: "Sistem Süreci" },
          { href: "#nasil-calisir", label: "Nasıl Çalışır?" },
          { href: "#karsilastirma", label: "Paketler" },
          { href: "/nfc-kart", label: "NFC Akıllı Kart", highlight: true },
        ]}
        ctaHref="/login"
        ctaLabel="İşletme Girişi"
      />

      {/* Hero Section with Live Dashboard Mockup */}
      <section className="relative z-10 pt-28 sm:pt-40 pb-16 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <a href="#surec" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md mb-8 hover:bg-blue-500/10 transition-colors cursor-pointer group">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-semibold text-blue-300 tracking-wide uppercase">Tüm Süreçleri Otomatize Edin</span>
            </a>

            <h1 className="text-4xl sm:text-7xl lg:text-[6rem] font-medium tracking-tighter leading-[1.1] sm:leading-[1] mb-6 sm:mb-8">
              Dijital Operasyonların <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-white/40">
                Geleceğine Bağlanın.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-900 dark:text-white/50 max-w-3xl mx-auto leading-relaxed mb-10 sm:mb-12 px-2 sm:px-0">
              Sıradan yazılımları unutun. Tüm E-Ticaret, Finans, Kargo ve Stok süreçlerinizin birbiriyle konuştuğu, gerçek zamanlı ve ışık hızında çalışan bulut işletim sistemi.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-24">
              <Link href="#karsilastirma" className="w-full sm:w-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-slate-900 dark:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                  Sistemi Başlat
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Active Dashboard 3D Mockup - Replaced with AdminDemo */}
          <motion.div 
            style={{ y: y2 }}
            initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full max-w-[1100px] relative perspective-[2000px]"
          >
            <div className="relative shadow-[0_0_80px_rgba(37,99,235,0.2)] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none rounded-2xl z-10"></div>
              <AdminDemo />{/* Forced rebuild v2 */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW: Massive Realistic System Process Animation */}
      <section id="surec" className="py-32 px-6 relative z-10 border-t border-slate-200 dark:border-black/5 dark:border-white/5 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Otomasyon Mimarisi</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium tracking-tight mb-6">Tüm Süreçleriniz Tek Merkezde.</h2>
            <p className="text-lg text-slate-900 dark:text-gray-500 dark:text-white/50 leading-relaxed">
              E-Ticaret, Finans, Lojistik ve Stok süreçleriniz tek bir yapay zeka destekli beyin tarafından anlık olarak yönetilir ve senkronize edilir.
            </p>
          </div>

          <AutomationSchema />
        </div>
      </section>

      {/* Feature Comparison Matrix & Simple Pricing */}
      <section id="karsilastirma" className="py-32 px-6 bg-transparent relative z-10 border-t border-slate-200 dark:border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-5xl font-medium tracking-tight mb-6">Şeffaf, Güçlü Paketler.</h2>
            <p className="text-lg text-slate-900 dark:text-gray-500 dark:text-white/50">Gizli maliyet yok. İhtiyacınıza uygun olanı seçin ve dünyanın en büyük altyapı özelliklerine anında erişin.</p>
          </div>

          <PricingSection />
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#020202] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                  <Image src="/logo.png" alt="Sentient Wire Logo" fill className="object-cover" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">SentientWire</span>
              </div>
              <p className="text-sm text-slate-900 dark:text-gray-400 dark:text-white/40 max-w-sm leading-relaxed mb-6">
                Türkiye'nin en gelişmiş bulut tabanlı, API öncelikli B2B/B2C Kurumsal Yönetim ve ERP Altyapısı. İşinizi global vizyonla ölçeklendirin.
              </p>
              <div className="flex items-center gap-4 text-slate-900 dark:text-gray-400 dark:text-white/30">
                <Shield className="w-5 h-5 hover:text-slate-900 dark:text-white transition-colors cursor-pointer" />
                <Lock className="w-5 h-5 hover:text-slate-900 dark:text-white transition-colors cursor-pointer" />
                <Globe className="w-5 h-5 hover:text-slate-900 dark:text-white transition-colors cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-6 text-sm uppercase tracking-wider">Ürün</h4>
              <ul className="space-y-4 text-sm text-slate-900 dark:text-gray-500 dark:text-white/50">
                <li><a href="#surec" className="hover:text-slate-900 dark:text-white transition-colors">Tüm Özellikler</a></li>
                <li><a href="#surec" className="hover:text-slate-900 dark:text-white transition-colors">Entegrasyonlar</a></li>
                <li><a href="#karsilastirma" className="hover:text-slate-900 dark:text-white transition-colors">Fiyatlandırma</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Geliştirici API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-6 text-sm uppercase tracking-wider">Çözümler</h4>
              <ul className="space-y-4 text-sm text-slate-900 dark:text-gray-500 dark:text-white/50">
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">B2B Toptancılar</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">E-Ticaret Şirketleri</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Lojistik Firmaları</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-6 text-sm uppercase tracking-wider">Kurumsal</h4>
              <ul className="space-y-4 text-sm text-slate-900 dark:text-gray-500 dark:text-white/50">
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">İletişim</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Kullanım Koşulları</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 dark:border-black/5 dark:border-white/5 text-xs text-slate-900 dark:text-gray-400 dark:text-white/30">
            <p>© {new Date().getFullYear()} SentientWire Yazılım Teknolojileri A.Ş. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistemler %100 Operasyonel
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
