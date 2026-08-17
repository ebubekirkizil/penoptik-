// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowLeft, Phone } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function TrackPage() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10 || cleaned.length > 11) {
      setError("Lütfen geçerli bir telefon numarası girin (10 veya 11 haneli).");
      return;
    }
    if (name.trim().length < 2) {
      setError("Lütfen adınızı veya soyadınızı girin.");
      return;
    }
    setLoading(true);
    setError("");
    // Navigate to results with phone and name parameter
    router.push(`/track/${cleaned}?n=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <AnimatedBackground />

      <header className="relative z-20 p-4 sm:p-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Ana Sayfaya Dön</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-20 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-surface/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border-color">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md">
                  <div className="text-white font-black text-xl italic">P</div>
                </div>
                <span className="font-black text-foreground text-lg tracking-tight">PEN <span className="text-primary">OPTİK</span></span>
              </div>
              <h1 className="text-3xl font-black text-foreground mb-2">Sipariş Sorgulama</h1>
              <p className="text-muted-foreground text-sm">
                Siparişinizi veya reçetenizi görmek için adınızı (veya soyadınızı) ve telefon numaranızı girin.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
                  Adınız veya Soyadınız
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Ahmet veya Yılmaz"
                    className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
                  Telefon Numaranız
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0555 123 45 67"
                    className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </div>
                {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠ {error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg mt-2 touch-manipulation"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Aranıyor...
                  </span>
                ) : (
                  "Siparişimi Göster"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border-color text-center">
              <p className="text-muted-foreground text-sm">
                Hesabınız yok mu?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Kayıt Olun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
