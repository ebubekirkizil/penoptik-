"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, DollarSign, Package, Truck, Database, Users, Server, Activity, LineChart } from "lucide-react";

export function AutomationSchema() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const leftNodes = [
    { icon: ShoppingCart, title: "E-Ticaret Ağları", desc: "Siparişler, İadeler", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
    { icon: Users, title: "Pazaryerleri", desc: "Trendyol, Hepsiburada", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
    { icon: DollarSign, title: "Finans & Ödeme", desc: "Stripe, İyzico", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
    { icon: Activity, title: "CRM Verileri", desc: "Müşteri Etkileşimi", color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]" }
  ];

  const rightNodes = [
    { icon: Database, title: "ERP & Ön Muhasebe", desc: "Fatura, Logo, Mikro", color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]" },
    { icon: Package, title: "Depo & Stok", desc: "Otomatik Senkron", color: "text-cyan-500 dark:text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]" },
    { icon: Truck, title: "Lojistik & Kargo", desc: "Barkod, Kurye", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
    { icon: LineChart, title: "Karar Destek (AI)", desc: "Canlı Analitik", color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]" }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-10 lg:py-0 relative lg:h-[650px] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-[#050505]/60 backdrop-blur-3xl border border-slate-200/50 dark:border-white/10 rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden px-4 sm:px-8 my-8">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] lg:bg-[size:32px_32px]"></div>

      {/* 
        ========================================
        DESKTOP LAYOUT (lg:block) 
        ========================================
      */}
      <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 1200 650" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="lineGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Lines Y positions: 16%, 38%, 61%, 84% based on justify-evenly of nodes */}
          {[105, 252, 398, 545].map((y, i) => (
            <g key={`left-${i}`}>
              <path d={`M 320 ${y} C 450 ${y}, 500 325, 600 325`} fill="none" stroke="url(#lineGradLeft)" strokeWidth="2" strokeDasharray="6 6" className="opacity-60" />
              <motion.circle r="3.5" fill={["#3b82f6", "#10b981", "#f59e0b", "#f43f5e"][i]} filter="url(#glow)">
                <animateMotion dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" path={`M 320 ${y} C 450 ${y}, 500 325, 600 325`} />
              </motion.circle>
            </g>
          ))}

          {[105, 252, 398, 545].map((y, i) => (
            <g key={`right-${i}`}>
              <path d={`M 600 325 C 700 325, 750 ${y}, 880 ${y}`} fill="none" stroke="url(#lineGradRight)" strokeWidth="2" strokeDasharray="6 6" className="opacity-60" />
              <motion.circle r="3.5" fill={["#a855f7", "#06b6d4", "#10b981", "#f97316"][i]} filter="url(#glow)">
                <animateMotion dur={`${2.7 + i * 0.2}s`} repeatCount="indefinite" path={`M 600 325 C 700 325, 750 ${y}, 880 ${y}`} />
              </motion.circle>
            </g>
          ))}
        </svg>
      </div>

      {/* Central Core (Desktop: absolute center, Mobile: relative top) */}
      <div className="order-1 lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-20 flex flex-col items-center justify-center mb-10 lg:mb-0">
        <div className="relative flex items-center justify-center w-40 h-40 lg:w-56 lg:h-56">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-blue-500/20 border-t-blue-500 border-r-blue-400"
          ></motion.div>
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 lg:inset-4 rounded-full border border-purple-500/20 border-b-purple-500 border-l-purple-400"
          ></motion.div>
          
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-[20px] lg:blur-[40px]"
          ></motion.div>
          
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center shadow-xl dark:shadow-[0_0_60px_rgba(37,99,235,0.4)] relative z-10 backdrop-blur-xl">
            <Server className="w-8 h-8 lg:w-12 lg:h-12 text-slate-800 dark:text-white mb-2" />
            <span className="text-[10px] lg:text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 tracking-widest uppercase">Sentient</span>
            <span className="text-[10px] lg:text-xs font-black text-slate-900 dark:text-white tracking-widest uppercase">Wire</span>
          </div>
        </div>
        
        {/* Mobile Connector Spine */}
        <div className="lg:hidden w-px h-12 bg-gradient-to-b from-blue-500/50 to-transparent mt-4"></div>
      </div>

      {/* Nodes Left (Desktop: absolute left, Mobile: relative stack) */}
      <div className="order-2 lg:absolute lg:left-10 lg:top-12 lg:bottom-12 flex flex-col justify-evenly gap-4 lg:gap-0 w-full lg:w-[280px] z-10">
        {leftNodes.map((node, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className={`flex items-center gap-4 p-4 rounded-2xl border ${node.border} bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md ${node.glow} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group`}
          >
            <div className={`w-12 h-12 rounded-xl ${node.bg} border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0`}>
              <node.icon className={`w-6 h-6 ${node.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm lg:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{node.title}</span>
              <span className="text-xs lg:text-sm text-slate-500 dark:text-white/50">{node.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Connector Spine Middle */}
      <div className="order-3 lg:hidden w-px h-12 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent my-2"></div>

      {/* Nodes Right (Desktop: absolute right, Mobile: relative stack) */}
      <div className="order-4 lg:absolute lg:right-10 lg:top-12 lg:bottom-12 flex flex-col justify-evenly gap-4 lg:gap-0 w-full lg:w-[280px] z-10">
        {rightNodes.map((node, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + (i * 0.15) }}
            className={`flex items-center gap-4 p-4 rounded-2xl border ${node.border} bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md ${node.glow} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 lg:flex-row-reverse lg:text-right group`}
          >
            <div className={`w-12 h-12 rounded-xl ${node.bg} border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0`}>
              <node.icon className={`w-6 h-6 ${node.color}`} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-sm lg:text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">{node.title}</span>
              <span className="text-xs lg:text-sm text-slate-500 dark:text-white/50">{node.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
