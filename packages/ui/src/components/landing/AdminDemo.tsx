"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, LineChart, Package, Users, ShieldCheck, Cpu, ArrowLeft, CheckCircle2, TrendingUp, Search } from "lucide-react";

export function AdminDemo() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nodes = [
    { 
      id: "ecommerce", icon: ShoppingBag, label: "E-Ticaret", 
      pos: { x: -140, y: -100 },
      classes: "bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20 hover:border-pink-500/50 hover:shadow-[0_0_40px_rgba(236,72,153,0.3)]",
      iconClass: "text-pink-400"
    },
    { 
      id: "finance", icon: LineChart, label: "Finans", 
      pos: { x: 140, y: -100 },
      classes: "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]",
      iconClass: "text-emerald-400"
    },
    { 
      id: "inventory", icon: Package, label: "Stok & Depo", 
      pos: { x: -140, y: 100 },
      classes: "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]",
      iconClass: "text-amber-400"
    },
    { 
      id: "crm", icon: Users, label: "CRM", 
      pos: { x: 140, y: 100 },
      classes: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]",
      iconClass: "text-blue-400"
    },
  ];

  return (
    <div className="w-full max-w-[1100px] mx-auto h-[600px] sm:h-[700px] bg-[#020202] rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.15)] overflow-hidden font-sans relative flex flex-col">
      {/* Top Bar */}
      <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-4 shrink-0 z-50">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
        </div>
        <div className="mx-auto flex items-center gap-2 px-4 py-1 rounded-md bg-white/5 border border-white/10 text-white/40 text-xs font-mono">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>system.sentientwire.com</span>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000]">
        
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Back Button */}
        <AnimatePresence>
          {activeModule && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => setActiveModule(null)}
              className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Merkeze Dön
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!activeModule ? (
            /* --- HUB VIEW --- */
            <motion.div 
              key="hub"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Central Core */}
              <div className="absolute w-36 h-36 md:w-48 md:h-48 rounded-full flex items-center justify-center backdrop-blur-xl border z-20 bg-blue-600/10 border-blue-500/30 shadow-[0_0_80px_rgba(59,130,246,0.2)]">
                <div className="relative flex items-center justify-center w-full h-full">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 border-t-blue-400 animate-[spin_4s_linear_infinite]"></div>
                  <div className="absolute inset-4 rounded-full border border-purple-400/20 border-b-purple-400 animate-[spin_3s_linear_infinite_reverse]"></div>
                  <div className="absolute inset-8 rounded-full bg-blue-500/10 blur-xl"></div>
                  <Cpu className="w-14 h-14 text-blue-400 relative z-10" />
                  <span className="absolute flex h-full w-full inset-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-10" style={{ animationDuration: '3s' }}></span>
                  </span>
                </div>
              </div>

              <div className="absolute text-center z-30" style={{ transform: `translateY(${isMobile ? '110px' : '130px'})` }}>
                <h3 className="text-sm md:text-xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  SentientWire Core
                </h3>
                <p className="text-[10px] md:text-xs mt-1.5 font-medium tracking-wide text-blue-200/50">
                  Otomasyon & Tam Senkronizasyon
                </p>
                <div className="mt-4 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-white/50 animate-pulse hidden md:inline-block">
                  Sistemi incelemek için modüllere tıklayın
                </div>
              </div>

              {/* Connecting Lines */}
              {nodes.map((node, i) => {
                const angle = Math.atan2(node.pos.y, node.pos.x) * (180 / Math.PI);
                return (
                  <div
                    key={`line-${i}`}
                    className="absolute h-[2px] bg-gradient-to-r from-blue-500/50 to-transparent origin-left z-10"
                    style={{
                      left: "50%", top: "50%",
                      width: isMobile ? 120 : 180,
                      transform: `translate(0, -50%) rotate(${angle}deg)`
                    }}
                  >
                    <motion.div 
                      animate={{ left: ["100%", "0%"], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "linear" }}
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]"
                    />
                  </div>
                );
              })}

              {/* Nodes (Clickable) */}
              {nodes.map((node, i) => {
                const multiplier = isMobile ? 0.8 : 1.4;
                return (
                  <motion.button
                    key={node.id}
                    onClick={() => setActiveModule(node.id)}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, x: node.pos.x * multiplier, y: node.pos.y * multiplier }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 70, damping: 15, delay: i * 0.1 }}
                    className={`absolute w-28 h-28 md:w-36 md:h-36 rounded-2xl flex flex-col items-center justify-center gap-3 border backdrop-blur-md transition-colors z-30 cursor-pointer ${node.classes}`}
                  >
                    <node.icon className={`w-8 h-8 md:w-10 md:h-10 ${node.iconClass}`} />
                    <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-white">
                      {node.label}
                    </span>
                    <div className="absolute top-3 right-3 flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            /* --- MODULE EXPLANATIONS --- */
            <motion.div
              key="explanation"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center p-6 md:p-12 z-20"
            >
              {activeModule === "ecommerce" && <EcommerceExplanation />}
              {activeModule === "finance" && <FinanceExplanation />}
              {activeModule === "inventory" && <InventoryExplanation />}
              {activeModule === "crm" && <CrmExplanation />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- MODULE ANIMATIONS ---

function EcommerceExplanation() {
  return (
    <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center gap-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
          <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-pink-400" /> E-Ticaret Otomasyonu
        </h2>
        <p className="text-gray-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
          Tüm pazar yerlerinden (Trendyol, Hepsiburada, Shopify) gelen siparişler tek bir panele düşer, otomatik onaylanır ve faturası kesilir.
        </p>
      </div>

      <div className="relative w-full h-[300px] bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden">
        {/* Fake Orders incoming */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 border-r border-white/10 p-4 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.5, duration: 0.5 }}
              className="bg-white/10 p-3 rounded-lg border border-white/5 flex items-center gap-3"
            >
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-3 h-3 md:w-4 md:h-4 text-pink-400" />
              </div>
              <div className="flex-1">
                <div className="h-1.5 md:h-2 w-12 md:w-16 bg-white/20 rounded mb-2"></div>
                <div className="h-1 md:h-1.5 w-8 md:w-10 bg-white/10 rounded"></div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* SentientWire processing */}
        <div className="absolute left-1/3 right-0 top-0 bottom-0 p-4 md:p-8 flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 }}
            className="w-full max-w-md bg-[#0a0a0a] rounded-xl border border-white/10 shadow-2xl p-4 md:p-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <span className="text-white text-xs md:text-sm font-bold">SentientWire Merkez</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] md:text-[10px] rounded font-bold uppercase">Senkronize</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-gray-400">Yeni Siparişler</span>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-white font-mono">+3 İşleniyor</motion.span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-pink-500 h-full rounded-full"
                ></motion.div>
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 pt-2">
                <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" /> Kargo Kodları Üretildi
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FinanceExplanation() {
  return (
    <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center gap-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
          <LineChart className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" /> Finansal Zeka
        </h2>
        <p className="text-gray-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
          Tüm gelir-gider verileriniz anlık olarak işlenir, karlılık oranlarınız saniyesinde hesaplanıp görselleştirilir.
        </p>
      </div>

      <div className="relative w-full h-[300px] bg-white/5 border border-white/10 rounded-2xl p-6 flex items-end justify-around gap-1 md:gap-2 overflow-hidden">
        {/* Animated Bar Chart */}
        {[40, 60, 45, 80, 55, 90, 75, 100].map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${height}%`, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.8, type: "spring" }}
            className="w-full max-w-[20px] md:max-w-[40px] bg-emerald-500/20 border-t border-emerald-400/50 rounded-t-lg relative group"
          >
             <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 text-[10px] md:text-xs font-mono font-bold">
               %{height}
             </div>
          </motion.div>
        ))}
        
        {/* Floating Data */}
        <motion.div 
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 md:top-8 left-4 md:left-8 bg-[#0a0a0a]/80 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10"
        >
          <div className="text-gray-400 text-[10px] md:text-xs mb-1">Anlık Ciro</div>
          <div className="text-lg md:text-2xl font-black text-emerald-400 flex items-center gap-2">
            ₺142.500 <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InventoryExplanation() {
  return (
    <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center gap-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
          <Package className="w-6 h-6 md:w-8 md:h-8 text-amber-400" /> Stok Senkronizasyonu
        </h2>
        <p className="text-gray-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
          Bir ürün satıldığında, SentientWire milisaniyeler içinde tüm platformlardaki (Trendyol, Amazon vb.) stoğu düşer.
        </p>
      </div>

      <div className="relative w-full h-[300px] bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden">
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* Box Stack */}
          <div className="relative flex flex-row md:flex-col-reverse gap-2">
             {[1, 2, 3, 4, 5].map((i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 1, scale: 1 }}
                 animate={i === 5 ? { opacity: [1, 1, 0], scale: [1, 1.1, 0], y: -10 } : {}}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="w-12 h-8 md:w-16 md:h-12 bg-amber-500/20 border border-amber-500/40 rounded shadow-lg flex items-center justify-center"
               >
                 <Package className="w-4 h-4 md:w-5 md:h-5 text-amber-500/50" />
               </motion.div>
             ))}
          </div>

          {/* Sync Signal */}
          <div className="relative w-1 h-20 md:w-32 md:h-1 bg-white/10 rounded-full hidden md:block">
             <motion.div
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_15px_#f59e0b]"
             />
          </div>

          {/* Platforms */}
          <div className="flex flex-col gap-3 md:gap-4">
             {["Trendyol", "Hepsiburada", "Shopify"].map((platform, i) => (
                <div key={i} className="bg-[#0a0a0a] p-2 md:p-3 rounded-lg border border-white/10 flex items-center justify-between w-40 md:w-48">
                  <span className="text-white text-[10px] md:text-xs font-bold">{platform}</span>
                  <motion.span 
                    animate={{ color: ["#9ca3af", "#f59e0b", "#9ca3af"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="text-gray-400 text-[10px] md:text-xs font-mono"
                  >
                    Stok: 4
                  </motion.span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CrmExplanation() {
  return (
    <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center gap-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
          <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-400" /> Akıllı CRM
        </h2>
        <p className="text-gray-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
          Dağınık müşteri bilgileri tekilleştirilir. Kim ne zaman ne almış, iade oranı nedir, hepsi tek bir profilde birleşir.
        </p>
      </div>

      <div className="relative w-full h-[300px] bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden flex items-center justify-center">
        
        {/* Floating Data Particles */}
        <div className="absolute inset-0 hidden md:block">
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <motion.div
               key={i}
               initial={{ x: Math.random() * 400 - 200, y: Math.random() * 200 - 100, opacity: 0 }}
               animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
               transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
               className="absolute top-1/2 left-1/2 w-8 h-8 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center"
             >
               <span className="text-blue-400 text-[8px]">Veri</span>
             </motion.div>
          ))}
        </div>

        {/* Central Profile Card */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="relative z-10 w-full max-w-[250px] md:w-64 bg-[#0a0a0a]/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 md:p-5 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-4 border-b border-white/10 pb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5 shrink-0">
               <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center">
                 <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
               </div>
            </div>
            <div>
              <div className="text-white font-bold text-xs md:text-sm">Ahmet Yılmaz</div>
              <div className="text-blue-400 text-[9px] md:text-[10px] uppercase">VIP Müşteri</div>
            </div>
          </div>
          <div className="space-y-2 md:space-y-3">
             <div className="flex justify-between text-[10px] md:text-xs">
               <span className="text-gray-500">Toplam Harcama</span>
               <span className="text-white font-mono">₺24.500</span>
             </div>
             <div className="flex justify-between text-[10px] md:text-xs">
               <span className="text-gray-500">İade Oranı</span>
               <span className="text-emerald-400 font-mono">%1.2</span>
             </div>
             <div className="flex justify-between text-[10px] md:text-xs">
               <span className="text-gray-500">Son Sipariş</span>
               <span className="text-white font-mono">2 gün önce</span>
             </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
