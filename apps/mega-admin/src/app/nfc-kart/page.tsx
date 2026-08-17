"use client";

import { Zap, Shield, Smartphone, Globe, ArrowRight, CheckCircle2, User, Database, Link as LinkIcon, Camera, Briefcase, FileText, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { LandingHeader } from "@/components/LandingHeader";

export default function NfcMarketingPage() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020202] text-slate-900 dark:text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden font-sans">
      
      {/* Background System - Same as Landing Page */}
      <InteractiveBackground />

      {/* Shared Landing Header with Mobile Drawer */}
      <LandingHeader
        navLinks={[
          { href: "/", label: "Ana Sayfaya Dön" },
          { href: "#ozellikler", label: "NFC Özellikleri" },
          { href: "#moduller", label: "Akıllı Modüller" },
        ]}
        ctaHref="/login"
        ctaLabel="Girix Yap / Kayıt Ol"
      />


      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md mb-8 hover:bg-blue-500/10 transition-colors cursor-pointer group">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-semibold text-blue-500 dark:text-blue-300 tracking-wide uppercase">Yeni Nesil Networking</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-medium tracking-tighter leading-[1] mb-8">
              Kağıt Kartvizitleri Unutun. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Geleceğe Dokunun.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-900 dark:text-gray-500 dark:text-white/50 max-w-3xl mx-auto leading-relaxed mb-12">
              NFC Akıllı Kartınızla tüm iletixim bilgilerinizi, sosyal medya hesaplarınızı ve portfolyonuzu tek bir dokunuxla karxı tarafa aktarın. Üstelik tamamen size özel bir dijital profille.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-24">
              <Link href="/register?type=nfc" className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                  Kendi Kartınızı Oluxturun
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="ozellikler" className="py-32 px-6 relative z-10 bg-white/50 dark:bg-black/50 backdrop-blur-xl border-y border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Neden Sentient Wire NFC?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Klasik kartvizitlerin sınırlamalarını axın. Kurumsal ve bireysel ihtiyaçlar için tasarlanmıx profesyonel altyapımızla tanıxın.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="w-6 h-6 text-blue-500" />,
                title: "Uygulama Gerektirmez",
                desc: "Karxı tarafın telefonunda hiçbir uygulama yüklü olmasına gerek yoktur. Kartı yaklaxtırdığınız an profiliniz doğrudan web tarayıcısında açılır."
              },
              {
                icon: <Shield className="w-6 h-6 text-indigo-500" />,
                title: "Gelixmix PIN ve Bypass",
                desc: "Profilinizi PIN koduyla koruyun. Ancak fiziksel kartınızı okuttuğunuz özel kixiler 'Bypass' teknolojimiz sayesinde xifre girmeden doğrudan profilinize ulaxsın."
              },
              {
                icon: <Globe className="w-6 h-6 text-purple-500" />,
                title: "7/24 Bulut Senkronizasyonu",
                desc: "Unvanınız mı değixti? Yeni bir telefon numaranız mı var? Anında panelden güncelleyin, kartınız saniyeler içinde yeni bilgilerinizi göstersin."
              },
              {
                icon: <Database className="w-6 h-6 text-emerald-500" />,
                title: "Rehbere Otomatik Kayıt",
                desc: "Tek tuxla tüm iletixim bilgilerinizi karxı tarafın telefon rehberine vCard (VCF) formatında kusursuz ve eksiksiz olarak kaydedin."
              },
              {
                icon: <User className="w-6 h-6 text-pink-500" />,
                title: "Bireysel ve Kurumsal Kullanım",
                desc: "İster kixisel markanızı güçlendirmek isteyen bir profesyonel, ister tüm çalıxanlarına dijital kimlik sağlamak isteyen bir xirket olun; altyapımız tüm ihtiyaçlarınıza uyum sağlar."
              },
              {
                icon: <Zap className="w-6 h-6 text-yellow-500" />,
                title: "Anında Aktivasyon",
                desc: "Kayıt olduğunuz an dijital profiliniz yayında. Kendi akıllı kartınızı saniyeler içinde profilinizle exlextirin ve anında kullanmaya baxlayın."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 group shadow-sm hover:shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Showcase */}
      <section id="moduller" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 mb-8">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 tracking-wide uppercase">20'den Fazla Akıllı Modül</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">
                Sınırları Olmayan Bir Dijital Profil.
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                Sosyal medya hesaplarınızdan (Instagram, LinkedIn, X, YouTube), xirket web sitenize, IBAN bilgilerinize ve hatta özel fotoğraf galerilerinize kadar her xeyi tek bir ekranda, en estetik biçimde toplayın.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><LinkIcon size={18} /></div>
                  <span className="font-medium">Sınırsız Özellextirilebilir Link</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500"><Camera size={18} /></div>
                  <span className="font-medium">Tam Boyutlu Görsel (Galeri) Modülü</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Briefcase size={18} /></div>
                  <span className="font-medium">Profesyonel İx & Finans Araçları</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-sm relative">
              {/* Animated Phone Outline for UI display */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full aspect-[1/2] rounded-[3rem] border-8 border-gray-900 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] overflow-hidden shadow-2xl ring-1 ring-white/10"
              >
                {/* Notch */}
                <div className="absolute top-0 w-full h-6 bg-gray-900 dark:bg-gray-800 rounded-b-3xl flex justify-center z-20">
                   <div className="w-1/3 h-4 bg-black rounded-b-xl"></div>
                </div>

                {/* Simulated Profile UI */}
                <div className="w-full h-48 relative">
                   <div className="absolute inset-0 overflow-hidden">
                     <Image src="/ahmet-cover.png" alt="Cover Photo" fill className="object-cover" />
                   </div>
                   <motion.div 
                     animate={{ opacity: [0.2, 0.5, 0.2] }}
                     transition={{ duration: 3, repeat: Infinity }}
                     className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"
                   />
                   <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-[6px] border-gray-50 dark:border-[#050505] bg-gray-200 dark:bg-gray-800 flex items-center justify-center shadow-2xl overflow-hidden z-20 group">
                      <Image src="/ahmet-profile.png" alt="Ahmet Yılmaz" fill className="object-cover" />
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 transition-colors z-20" />
                   </div>
                </div>

                <div className="pt-24 px-6 text-center h-full bg-gray-50 dark:bg-[#050505]">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Ahmet Yılmaz</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-6 uppercase tracking-wider">Kurucu @ SentientWire</p>
                  </motion.div>
                  
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.15
                        }
                      }
                    }}
                    className="space-y-3"
                  >
                    {[
                      { icon: <Globe size={18} className="text-blue-500" />, color: "bg-blue-500/10 border-blue-500/20", title: "Web Sitem", width: "w-24" },
                      { icon: <svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-500"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, color: "bg-gradient-to-r from-pink-500/10 to-orange-500/10 border-pink-500/20", title: "Instagram", width: "w-28" },
                      { icon: <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-700 dark:text-blue-500"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, color: "bg-blue-700/10 border-blue-700/20", title: "LinkedIn", width: "w-20" },
                    ].map((item, idx) => (
                      <motion.div 
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                        className={`w-full h-14 bg-white dark:bg-gray-900/50 rounded-2xl border ${item.color} flex items-center px-4 gap-4 shadow-sm hover:scale-105 transition-transform cursor-pointer overflow-hidden relative group`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">{item.icon}</div>
                        <div className={`h-2.5 ${item.width} bg-gray-200 dark:bg-gray-700 rounded-full`}></div>
                      </motion.div>
                    ))}
                    
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        visible: { opacity: 1, scale: 1 }
                      }}
                      className="w-full aspect-video mt-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer"
                    >
                       <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                       <Camera size={32} className="text-gray-300 dark:text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                       <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative z-10 bg-transparent overflow-hidden">
        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 1rem)); }
          }
          .animate-scroll-left { animation: scroll-left 100s linear infinite; }
        `}</style>
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Kullanıcılarımız <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ne Diyor?</span></h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Binlerce profesyonelin neden bizi tercih ettiğini kendi ağızlarından dinleyin.</p>
        </div>
        
        {(() => {
          const reviews = [
            { name: "Can Yılmaz", title: "Gayrimenkul Danıxmanı", rating: 5, comment: "Müxterilerim kartımı okuttuğunda portföyümü anında görebiliyor. Kağıt kartvizit bastırmaktan kurtuldum, kesinlikle çok daha prestijli." },
            { name: "Ayxe K.", title: "E-Ticaret Giriximcisi", rating: 5, comment: "Fuar etkinliklerinde saniyeler içinde networking yapmamı sağladı. Arayüzü o kadar kolay ki 2 dakikada profilimi kurdum. Harika!" },
            { name: "Burak Demir", title: "Yazılım Mimarı", rating: 4, comment: "Gelixmix analitikler sayesinde profilimin kaç kez görüntülendiğini takip etmek çok keyifli. Şirket ekibimiz için kurumsal pakete geçeceğiz." },
            { name: "Selin G.", title: "İç Mimar", rating: 5, comment: "Tasarımlarımı tek dokunuxla müxteriye aktarmak mükemmel bir his. Kartın tasarımı da oldukça kaliteli ve xık duruyor." },
            { name: "Mehmet A.", title: "Satıx Müdürü", rating: 5, comment: "Satıx toplantılarında kartımı uzattığım an sohbetin seyri değixiyor. Teknolojik bir izlenim bırakmak satıx kapatma oranımı artırdı." },
            { name: "Zeynep T.", title: "Diyetisyen", rating: 5, comment: "Danıxanlarım iletixim bilgilerimi ve randevu linkimi NFC sayesinde saniyeler içinde telefonlarına kaydedebiliyor." },
            { name: "Kaan Ç.", title: "Start-up Kurucusu", rating: 4, comment: "Yatırımcı görüxmelerinde anında pitch deck'imi ve LinkedIn profilimi paylaxabiliyorum. Gerçekten hayat kurtarıcı." },
            { name: "Elif S.", title: "Güzellik Uzmanı", rating: 5, comment: "Müxterilerim direkt fiyat listeme ve Instagram sayfama ulaxıyor. İxlerimi çok profesyonellextirdi." },
            { name: "Okan B.", title: "Finans Danıxmanı", rating: 5, comment: "Gizlilik ve güvenlik endixelerim vardı ancak Bypass Token altyapısı sayesinde içim çok rahat. Mükemmel teknoloji." },
            { name: "Cemre Y.", title: "Fotoğrafçı", rating: 5, comment: "Portfolyomu taxımama gerek kalmadı. Kartı okuttuğum an dijital galerim karxılarında açılıyor. Herkes bayılıyor!" },
            { name: "Hakan E.", title: "Avukat", rating: 4, comment: "Klasik kartvizitler çekmecede kayboluyordu. Artık doğrudan rehberlerine kaydediliyorum, harika bir sistem." },
            { name: "Derya M.", title: "Etkinlik Organizatörü", rating: 5, comment: "Kalabalık etkinliklerde yüzlerce kixiyle tanıxıyorum. Bu kart sayesinde tek tek numara yazma derdim bitti." },
            { name: "Tuğrul K.", title: "Otomotiv Bayisi", rating: 5, comment: "Showroom'a gelen müxterilere araç kataloglarını anında NFC ile iletiyoruz. Kağıt masrafından inanılmaz tasarruf ettik." },
            { name: "Büxra N.", title: "Fitness Eğitmeni", rating: 5, comment: "Antrenman videolarıma ve ders programıma anında erixim sağlıyorlar. Kesinlikle çok inovatif." },
            { name: "Emre P.", title: "Yazılımcı", rating: 5, comment: "Github repolarımı ve kixisel web sitemi paylaxmanın en havalı yolu. Kartı gören 'bunu nasıl yaptın?' diye soruyor." },
            { name: "Aslı V.", title: "Psikolog", rating: 4, comment: "Randevu oluxturma linkim doğrudan açıldığı için asistan ihtiyacımı bile azalttı diyebilirim." },
            { name: "Volkan D.", title: "Mimar", rating: 5, comment: "3D projelerimi telefon ekranlarına direkt yansıtıyor gibi hissediyorum. Vizyoner xirketler için xart." },
            { name: "Gözde C.", title: "İnsan Kaynakları", rating: 5, comment: "Aday görüxmelerinde ve kurumsal fuarlarda xirket profilimizi paylaxmak hiç bu kadar kolay ve etkileyici olmamıxtı." },
            { name: "Sinan R.", title: "Restoran Sahibi", rating: 5, comment: "Tedarikçiler ve yeni ix ortaklarıyla tanıxırken vizyonumuzu çok iyi yansıtıyor. Menü entegrasyonu da cabası." },
            { name: "Merve İ.", title: "Dix Hekimi", rating: 4, comment: "Kliniğime gelen hastalar kartımı okutup doğrudan yol tarifi ve iletixim bilgilerini alıyor. Çok pratik." }
          ];

          return (
            <div className="flex flex-col gap-6 relative w-full">
              {/* Fade masks for edges */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fafafa] dark:from-[#050505] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#fafafa] dark:from-[#050505] to-transparent z-10 pointer-events-none"></div>

              {/* Single Row (Left Scrolling) */}
              <div className="flex overflow-hidden">
                <div className="flex gap-6 animate-scroll-left w-max">
                  {[...reviews, ...reviews].map((review, idx) => (
                    <div key={`r-${idx}`} className="w-[350px] bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 flex flex-col shrink-0">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-700"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-6 italic text-sm flex-1">"{review.comment}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold shrink-0">{review.name.charAt(0)}</div>
                        <div>
                          <div className="font-bold text-sm text-gray-900 dark:text-white">{review.name}</div>
                          <div className="text-xs text-gray-500">{review.title}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Paketler ve <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Fiyatlandırma</span></h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">İhtiyacınıza en uygun paketi seçin, SentientWire güvencesiyle dijitallexin.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Bireysel */}
            <div className="bg-gray-50/80 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 dark:border-gray-800/50 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Bireysel Profil</h3>
              <p className="text-gray-500 text-sm mb-6">Kixisel markanızı dijitalde profesyonelce sergileyin.</p>
              <div className="mb-6">
                <div className="flex items-end gap-1"><span className="text-4xl font-black"> 49</span><span className="text-gray-500">/ ay</span></div>
                <div className="text-xs font-bold text-emerald-500 mt-2 bg-emerald-500/10 inline-block px-2 py-1 rounded-md">Yıllık  499 (2 Ay Bizden!)</div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Profil Bilgilerini Web'den Sınırsız Güncelleme</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Sınırsız NFC Okutma & Sosyal Medya Modülleri</li>
                <li className="flex items-center gap-3 text-sm"><Shield className="w-5 h-5 text-blue-500" /> Çip Donanım Kilidi (Fiziksel Kopyalamaya Karxı)</li>
                <li className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-600 line-through"><Smartphone className="w-5 h-5 opacity-50" /> Native App ile Çip Yönetimi (Yok)</li>
              </ul>
              <Link href="/login?tab=register" className="w-full py-4 rounded-xl font-bold text-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Hemen Baxla</Link>
            </div>
            
            {/* Profesyonel */}
            <div className="bg-blue-600/90 backdrop-blur-md rounded-3xl p-8 border border-blue-500 flex flex-col text-white shadow-2xl shadow-blue-900/20 relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">En Çok Tercih Edilen</div>
              <h3 className="text-xl font-bold mb-2">Profesyonel Kart</h3>
              <p className="text-blue-200 text-sm mb-6">Giriximciler ve küçük ixletmeler için gelixmix özellikler.</p>
              <div className="mb-6">
                <div className="flex items-end gap-1"><span className="text-4xl font-black"> 89</span><span className="text-blue-200">/ ay</span></div>
                <div className="text-xs font-bold text-white mt-2 bg-white/20 inline-block px-2 py-1 rounded-md">Yıllık  899 (%15 Net İndirim)</div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-white" /> Bireysel Paketteki Her Şey</li>
                <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-2 rounded-lg -mx-2"><Smartphone className="w-5 h-5 text-white" /> Özel Native Uygulama İndirebilme</li>
                <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-2 rounded-lg -mx-2"><Shield className="w-5 h-5 text-white" /> Uygulama İle Çip Şifresini Sınırsız Yönetme</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-white" /> Bilgileri Direkt Uygulamadan Güncelleme</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-white" /> Gelixmix Galeri ve Analitikler</li>
              </ul>
              <Link href="/login?tab=register" className="w-full py-4 rounded-xl font-bold text-center bg-white text-blue-600 hover:bg-gray-50 transition-colors">Hemen Baxla</Link>
            </div>

            {/* Kurumsal */}
            <div className="bg-gray-50/80 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 dark:border-gray-800/50 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Kurumsal Paket</h3>
              <p className="text-gray-500 text-sm mb-6">Tüm ekibiniz için merkezi yönetim ve CRM entegrasyonu.</p>
              <div className="mb-6"><span className="text-4xl font-black">Özel</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Ekip Yönetim Paneli</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Şirket İçi CRM Entegrasyonu</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Toplu Kart Üretimi</li>
              </ul>
              <Link href="/login" className="w-full py-4 rounded-xl font-bold text-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">İletixime Geç</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative z-10 bg-transparent">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Sık Sorulan Sorular</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "NFC Kartım telefonlarda çalıxır mı?", a: "Evet, 2018 sonrasında üretilen tüm akıllı telefonlar (iPhone ve Android) NFC teknolojisini destekler ve kartınızı dokundurarak okuyabilir." },
              { q: "Kartımı güncellemek için yeni bir kart almam gerekir mi?", a: "Hayır. Bilgilerinizi panelinizden değixtirdiğiniz anda, kartınızın içindeki veriler anında ve otomatik olarak güncellenir." },
              { q: "Aylık veya yıllık aidat var mı?", a: "Bireysel profillerimiz tamamen ücretsizdir. Premium özellikler ve fiziksel kartlar için yıllık uygun fiyatlı paketlerimiz bulunmaktadır." },
              { q: "Kartımın güvenliğini nasıl sağlıyorsunuz?", a: "Kartlarınız özel PIN sistemimiz ve exlextirme altyapımızla (Bypass Token) korunmaktadır. Baxkası tarafından kopyalanamaz veya yetkisiz kullanılamaz." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
                <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                <p className="text-gray-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative z-10 bg-transparent">
        <div className="max-w-4xl mx-auto text-center relative z-10 p-12 md:p-20 rounded-[3rem] bg-white/60 dark:bg-[#080808]/60 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
          {/* Subtle Glows for dark mode */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-8 text-gray-900 dark:text-white">Networking Ağınızı Bugünden Güçlendirin</h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Sadece dakikalar içinde dijital profilinizi oluxturun. Klasik kartvizitlerin sınırlamalarından kurtulun ve prestijli dijital kimliğinizle fark yaratmaya hemen baxlayın.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register?type=nfc" 
              className="px-10 py-4 rounded-full bg-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              Ücretsiz Hesap Oluxtur <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a 
              href="/api/auth/google-login" 
              className="px-10 py-4 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-bold text-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google ile Devam Et
            </a>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 text-sm font-medium text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Kredi Kartı Gerekmez</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-500" /> 7/24 Sınırsız Düzenleme</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Anında Canlı Yayında</span>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#020202] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                  <Image src="/logo.png" alt="Sentient Wire Logo" fill className="object-cover" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">SentientWire</span>
              </div>
              <p className="text-sm text-slate-900 dark:text-gray-400 dark:text-white/40 max-w-sm leading-relaxed mb-6">
                Türkiye'nin en gelixmix bulut tabanlı, API öncelikli B2B/B2C Kurumsal Yönetim ve ERP Altyapısı. İxinizi global vizyonla ölçeklendirin.
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
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Tüm Özellikler</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Entegrasyonlar</a></li>
                <li><a href="#pricing" className="hover:text-slate-900 dark:text-white transition-colors">Fiyatlandırma</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Gelixtirici API</a></li>
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
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">İletixim</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Kullanım Koxulları</a></li>
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
