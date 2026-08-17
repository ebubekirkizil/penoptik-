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

  return (
    <div className="w-full max-w-6xl mx-auto py-16 relative h-[600px] flex items-center justify-center bg-white/60 dark:bg-[#050505]/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(37,99,235,0.05)] overflow-x-auto overflow-y-hidden snap-x">
      <div className="min-w-[1024px] w-full h-full relative flex items-center justify-center snap-center">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        {/* SVG Connections Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
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

        {/* Static Lines Left */}
        <path d="M 250 120 C 400 120, 450 300, 560 300" fill="none" stroke="url(#lineGradLeft)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 250 240 C 400 240, 450 300, 560 300" fill="none" stroke="url(#lineGradLeft)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 250 360 C 400 360, 450 300, 560 300" fill="none" stroke="url(#lineGradLeft)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 250 480 C 400 480, 450 300, 560 300" fill="none" stroke="url(#lineGradLeft)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Animated Data Packets Left */}
        <motion.circle r="3" fill="#60a5fa" filter="url(#glow)">
          <animateMotion dur="3s" repeatCount="indefinite" path="M 250 120 C 400 120, 450 300, 560 300" />
        </motion.circle>
        <motion.circle r="3" fill="#34d399" filter="url(#glow)">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M 250 240 C 400 240, 450 300, 560 300" />
        </motion.circle>
        <motion.circle r="3" fill="#fbbf24" filter="url(#glow)">
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M 250 360 C 400 360, 450 300, 560 300" />
        </motion.circle>
        <motion.circle r="3" fill="#f87171" filter="url(#glow)">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M 250 480 C 400 480, 450 300, 560 300" />
        </motion.circle>


        {/* Static Lines Right */}
        <path d="M 592 300 C 700 300, 750 120, 900 120" fill="none" stroke="url(#lineGradRight)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 592 300 C 700 300, 750 240, 900 240" fill="none" stroke="url(#lineGradRight)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 592 300 C 700 300, 750 360, 900 360" fill="none" stroke="url(#lineGradRight)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 592 300 C 700 300, 750 480, 900 480" fill="none" stroke="url(#lineGradRight)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Animated Data Packets Right */}
        <motion.circle r="3" fill="#a78bfa" filter="url(#glow)">
          <animateMotion dur="2.7s" repeatCount="indefinite" path="M 592 300 C 700 300, 750 120, 900 120" />
        </motion.circle>
        <motion.circle r="3" fill="#60a5fa" filter="url(#glow)">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M 592 300 C 700 300, 750 240, 900 240" />
        </motion.circle>
        <motion.circle r="3" fill="#34d399" filter="url(#glow)">
          <animateMotion dur="2.4s" repeatCount="indefinite" path="M 592 300 C 700 300, 750 360, 900 360" />
        </motion.circle>
        <motion.circle r="3" fill="#fb923c" filter="url(#glow)">
          <animateMotion dur="3.1s" repeatCount="indefinite" path="M 592 300 C 700 300, 750 480, 900 480" />
        </motion.circle>
      </svg>

      {/* Central Core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative flex items-center justify-center w-40 h-40">
          {/* Rotating Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-blue-500/20 border-t-blue-400"
          ></motion.div>
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-purple-500/20 border-b-purple-400"
          ></motion.div>
          
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-[20px]"
          ></motion.div>
          
          <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#050505] border border-black/10 dark:border-white/10 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] relative z-10 backdrop-blur-md">
            <Server className="w-8 h-8 text-gray-900 dark:text-white mb-1" />
            <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wider uppercase mt-1">SentientWire</span>
          </div>
        </div>
      </div>

      {/* Nodes Left */}
      <div className="absolute left-10 top-0 bottom-0 flex flex-col justify-around z-10 w-60 py-10">
        {[
          { icon: ShoppingCart, title: "E-Ticaret Ağları", desc: "Siparişler, İadeler", color: "text-blue-400", border: "border-blue-500/20", glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
          { icon: Users, title: "Pazaryerleri", desc: "Trendyol, Hepsiburada", color: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
          { icon: DollarSign, title: "Finans & Ödeme", desc: "Stripe, İyzico", color: "text-amber-400", border: "border-amber-500/20", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
          { icon: Activity, title: "CRM Verileri", desc: "Müşteri Etkileşimi", color: "text-rose-400", border: "border-rose-500/20", glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]" }
        ].map((node, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className={`flex items-center gap-4 p-3.5 rounded-2xl border ${node.border} bg-gray-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm ${node.glow} relative group hover:-translate-y-1 transition-transform`}
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0">
              <node.icon className={`w-5 h-5 ${node.color}`} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white/90">{node.title}</div>
              <div className="text-xs text-gray-400 dark:text-white/40">{node.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Nodes Right */}
      <div className="absolute right-10 top-0 bottom-0 flex flex-col justify-around z-10 w-60 py-10">
        {[
          { icon: Database, title: "ERP & Ön Muhasebe", desc: "Fatura, Logo, Mikro", color: "text-purple-400", border: "border-purple-500/20", glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]" },
          { icon: Package, title: "Depo & Stok", desc: "Otomatik Senkron", color: "text-cyan-400", border: "border-cyan-500/20", glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]" },
          { icon: Truck, title: "Lojistik & Kargo", desc: "Barkod, Kurye", color: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
          { icon: LineChart, title: "Karar Destek (AI)", desc: "Canlı Analitik", color: "text-orange-400", border: "border-orange-500/20", glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]" }
        ].map((node, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + (i * 0.2) }}
            className={`flex items-center gap-4 p-3.5 rounded-2xl border ${node.border} bg-gray-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm ${node.glow} relative group hover:-translate-y-1 transition-transform flex-row-reverse text-right`}
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0">
              <node.icon className={`w-5 h-5 ${node.color}`} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white/90">{node.title}</div>
              <div className="text-xs text-gray-400 dark:text-white/40">{node.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  );
}
