"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ShoppingBag, LineChart, Package, Users, Database, Zap, ArrowRight, Activity, ShieldCheck, Cpu } from "lucide-react";

export function AdminDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const [phase, setPhase] = useState<"chaos" | "harmony">("chaos");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check mobile on mount
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    if (isInView) {
      // Start in chaos, transition to harmony after 2.5 seconds
      const timer = setTimeout(() => {
        setPhase("harmony");
      }, 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [isInView]);

  // Nodes for the animation
  const nodes = [
    { 
      id: "ecommerce", icon: ShoppingBag, label: "E-Ticaret", 
      chaosPos: { x: -60, y: -90 }, harmonyPos: { x: -140, y: -100 }, 
      classes: "bg-pink-500/10 border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.1)]",
      iconClass: "text-pink-400"
    },
    { 
      id: "finance", icon: LineChart, label: "Finans", 
      chaosPos: { x: 70, y: -70 }, harmonyPos: { x: 140, y: -100 }, 
      classes: "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]",
      iconClass: "text-emerald-400"
    },
    { 
      id: "inventory", icon: Package, label: "Stok & Depo", 
      chaosPos: { x: -80, y: 80 }, harmonyPos: { x: -140, y: 100 }, 
      classes: "bg-amber-500/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]",
      iconClass: "text-amber-400"
    },
    { 
      id: "crm", icon: Users, label: "CRM", 
      chaosPos: { x: 60, y: 100 }, harmonyPos: { x: 140, y: 100 }, 
      classes: "bg-blue-500/10 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]",
      iconClass: "text-blue-400"
    },
  ];

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-[1100px] mx-auto h-[600px] sm:h-[700px] bg-[#020202] rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.15)] overflow-hidden font-sans relative flex flex-col"
    >
      {/* Top Bar - Mac style */}
      <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-4 shrink-0 z-20">
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

      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000]">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="relative z-10 w-full h-full flex items-center justify-center">
          
          {/* Central Core */}
          <motion.div
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={
              phase === "chaos" 
                ? { scale: 1, opacity: 0.2, rotate: -5 } 
                : { scale: 1, opacity: 1, rotate: 0 }
            }
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className={`absolute w-36 h-36 md:w-48 md:h-48 rounded-full flex items-center justify-center backdrop-blur-xl border z-20 ${
              phase === "chaos" 
                ? "bg-red-500/5 border-red-500/20" 
                : "bg-blue-600/10 border-blue-500/30 shadow-[0_0_80px_rgba(59,130,246,0.2)]"
            }`}
          >
            {phase === "chaos" ? (
               <Activity className="w-12 h-12 text-red-500/40 animate-pulse" />
            ) : (
               <div className="relative flex items-center justify-center w-full h-full">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 border-t-blue-400 animate-[spin_4s_linear_infinite]"></div>
                  <div className="absolute inset-4 rounded-full border border-purple-400/20 border-b-purple-400 animate-[spin_3s_linear_infinite_reverse]"></div>
                  <div className="absolute inset-8 rounded-full bg-blue-500/10 blur-xl"></div>
                  <Cpu className="w-14 h-14 text-blue-400 relative z-10" />
                  
                  {/* Ripples */}
                  <span className="absolute flex h-full w-full inset-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-10" style={{ animationDuration: '3s' }}></span>
                  </span>
               </div>
            )}
          </motion.div>

          {/* Central Label */}
          <motion.div
            layout
            animate={{
              y: phase === "chaos" ? (isMobile ? 85 : 100) : (isMobile ? 110 : 130),
              opacity: 1
            }}
            className="absolute text-center z-30"
          >
            <h3 className={`text-sm md:text-xl font-black tracking-widest uppercase ${phase === "chaos" ? "text-red-400/80" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"}`}>
              {phase === "chaos" ? "Veri Siloları" : "SentientWire Core"}
            </h3>
            <p className={`text-[10px] md:text-xs mt-1.5 font-medium tracking-wide ${phase === "chaos" ? "text-red-500/50" : "text-blue-200/50"}`}>
              {phase === "chaos" ? "Kopuk & Verimsiz Sistemler" : "Tam Senkronizasyon & Otomasyon"}
            </p>
          </motion.div>

          {/* Connecting Lines */}
          <AnimatePresence>
            {phase === "harmony" && nodes.map((node, i) => {
               // Calculate angle and distance based on harmony positions
               const angle = Math.atan2(node.harmonyPos.y, node.harmonyPos.x) * (180 / Math.PI);
               
               return (
                 <motion.div
                   key={`line-${i}`}
                   initial={{ opacity: 0, width: 0 }}
                   animate={{ opacity: 1, width: isMobile ? 120 : 180 }}
                   exit={{ opacity: 0 }}
                   transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                   className="absolute h-[2px] bg-gradient-to-r from-blue-500/80 to-transparent origin-left z-10"
                   style={{
                     left: "50%",
                     top: "50%",
                     transform: `translate(0, -50%) rotate(${angle}deg)`
                   }}
                 >
                    {/* Data flowing dots (Particles) */}
                    <motion.div 
                      animate={{ left: ["100%", "0%"], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "linear" }}
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]"
                    />
                 </motion.div>
               );
            })}
          </AnimatePresence>

          {/* Nodes */}
          {nodes.map((node, i) => {
            const isChaos = phase === "chaos";
            const x = isChaos ? node.chaosPos.x : node.harmonyPos.x;
            const y = isChaos ? node.chaosPos.y : node.harmonyPos.y;
            const multiplier = isMobile ? 0.8 : 1.4; // Scale positions for screen size

            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: x * multiplier,
                  y: y * multiplier,
                  rotate: isChaos ? (i % 2 === 0 ? -8 : 8) : 0
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: isChaos ? 40 : 70, 
                  damping: 15,
                  delay: isChaos ? i * 0.1 : 0
                }}
                className={`absolute w-28 h-28 md:w-36 md:h-36 rounded-2xl flex flex-col items-center justify-center gap-3 border backdrop-blur-md transition-all duration-1000 z-30 ${
                  isChaos 
                    ? "bg-white/5 border-white/10 grayscale opacity-80" 
                    : `${node.classes} grayscale-0 opacity-100`
                }`}
              >
                {/* Erratic jitter for chaos */}
                {isChaos && (
                  <motion.div 
                    animate={{ x: [-2, 2, -1, 3, 0], y: [1, -2, 2, -1, 0] }}
                    transition={{ duration: 0.4 + (i * 0.1), repeat: Infinity, repeatType: "mirror" }}
                    className="absolute inset-0 border border-red-500/20 rounded-2xl"
                  />
                )}

                <node.icon className={`w-8 h-8 md:w-10 md:h-10 transition-colors duration-1000 ${isChaos ? "text-white/30" : node.iconClass}`} />
                <span className={`text-[11px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-1000 ${isChaos ? "text-white/40" : "text-white"}`}>
                  {node.label}
                </span>

                {/* Status indicator */}
                <div className="absolute top-3 right-3 flex space-x-1">
                   {isChaos ? (
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   ) : (
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                   )}
                </div>
              </motion.div>
            );
          })}

        </div>

        {/* Phase Toggle Button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
          <button 
            onClick={() => setPhase(p => p === "chaos" ? "harmony" : "chaos")}
            className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all backdrop-blur-xl flex items-center gap-3 shadow-2xl group"
          >
            {phase === "chaos" ? "Sistemi Başlat (Çözüm)" : "Karmaşayı Göster (Sorun)"}
            <Zap className={`w-4 h-4 transition-transform group-hover:scale-125 ${phase === "chaos" ? "text-blue-400" : "text-emerald-400"}`} />
          </button>
        </div>
        
      </div>
    </div>
  );
}
