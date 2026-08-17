"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Sun, Moon, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavLink {
  href: string;
  label: string;
  isExternal?: boolean;
  highlight?: boolean;
}

interface LandingHeaderProps {
  navLinks?: NavLink[];
  ctaHref?: string;
  ctaLabel?: string;
}

export function LandingHeader({
  navLinks = [],
  ctaHref = "/login",
  ctaLabel = "İşletme Girişi",
}: LandingHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 h-full w-72 z-[70] md:hidden
                         bg-white dark:bg-[#0d0d0d]
                         border-r border-slate-200 dark:border-white/10
                         shadow-2xl flex flex-col"
            >
              {/* Drawer Top */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-md">
                    <Image src="/logo.png" alt="SentientWire" fill className="object-cover" />
                  </div>
                  <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                    SentientWire
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full
                             bg-slate-100 dark:bg-white/10
                             hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-700 dark:text-white" />
                </button>
              </div>

              {/* Drawer Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                {/* Ana Sayfa her zaman */}
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl
                             text-sm font-medium text-slate-600 dark:text-white/60
                             hover:bg-slate-100 dark:hover:bg-white/10
                             hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <Home className="w-4 h-4 flex-shrink-0" />
                  Ana Sayfa
                </Link>

                {navLinks.map((link) =>
                  link.highlight ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl
                                 text-sm font-bold text-blue-600 dark:text-blue-400
                                 bg-blue-50 dark:bg-blue-500/10
                                 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                    >
                      <Zap className="w-4 h-4 flex-shrink-0" />
                      {link.label}
                    </a>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl
                                 text-sm font-medium text-slate-600 dark:text-white/60
                                 hover:bg-slate-100 dark:hover:bg-white/10
                                 hover:text-slate-900 dark:hover:text-white transition-all"
                    >
                      {link.label}
                    </a>
                  )
                )}
              </nav>

              {/* Drawer Footer: Theme Toggle + CTA */}
              <div className="px-4 pb-6 pt-3 border-t border-slate-200 dark:border-white/10 space-y-3">
                {/* Tema Değiştir Satırı */}
                <div className="flex items-center justify-between px-2 py-2 rounded-xl
                                bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <span className="text-sm font-medium text-slate-600 dark:text-white/60 ml-2">
                    Tema
                  </span>
                  <ThemeToggle className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10
                                          hover:bg-slate-200 dark:hover:bg-white/20
                                          text-slate-700 dark:text-white
                                          flex items-center justify-center transition-colors
                                          border border-slate-200 dark:border-white/10" />
                </div>

                {/* Giriş Butonu */}
                <Link
                  href={ctaHref}
                  onClick={() => setOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-xl
                             bg-gradient-to-r from-blue-600 to-violet-600
                             text-white text-sm font-bold shadow-lg
                             hover:opacity-90 transition-opacity"
                >
                  {ctaLabel}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Fixed Header Bar ── */}
      <header className="fixed top-0 w-full z-50
                         border-b border-black/10 dark:border-white/5
                         bg-white/70 dark:bg-[#020202]/70
                         backdrop-blur-2xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Left: Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Menüyü Aç"
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full
                         bg-black/5 dark:bg-white/10
                         hover:bg-black/10 dark:hover:bg-white/20
                         border border-black/10 dark:border-white/10
                         transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-white" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden
                              group-hover:scale-105 transition-transform duration-500
                              shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <Image src="/logo.png" alt="Sentient Wire Logo" fill className="object-cover" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Sentient</span>
                <span className="text-lg font-medium text-gray-500 dark:text-white/50 tracking-tight">Wire</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) =>
              link.highlight ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-blue-600 dark:text-blue-400
                             hover:text-blue-700 dark:hover:text-blue-300
                             transition-colors flex items-center gap-1"
                >
                  <Zap className="w-4 h-4" />
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 dark:text-white/60
                             hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Right: ThemeToggle (desktop only) + CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle className="hidden md:flex w-10 h-10 rounded-full
                                    bg-black/5 hover:bg-black/10
                                    dark:bg-white/10 dark:hover:bg-white/20
                                    text-gray-900 dark:text-white
                                    items-center justify-center transition-colors
                                    border border-black/10 dark:border-white/10
                                    backdrop-blur-md flex-shrink-0" />
            <Link
              href={ctaHref}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                         bg-black/5 hover:bg-black/10
                         dark:bg-white/10 dark:hover:bg-white/20
                         text-gray-900 dark:text-white
                         border border-black/10 dark:border-white/10
                         backdrop-blur-md transition-colors"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
