"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type FirmData = {
  name: string;
  domain: string | null;
};

export function FirmLoginClient({ firm, basePath }: { firm: FirmData, basePath: string }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const idVal = identifier.trim();
    const passVal = password.trim();

    try {
      // Customer Login Attempt
      const customerRes = await fetch("/api/auth/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: idVal, password: passVal }),
      });
      
      const data = await customerRes.json();

      if (!customerRes.ok) {
        throw new Error(data.error || "Girix baxarısız. Lütfen bilgilerinizi kontrol edin.");
      }

      if (data.success && data.customer?.phone) {
        if (data.requiresPasswordChange) {
          sessionStorage.setItem("tempCustomerId", data.customer.id);
          sessionStorage.setItem("tempCustomerPhone", data.customer.phone);
          sessionStorage.setItem("tempCustomerPassword", passVal);
          router.push(`${basePath}/change-password`);
        } else {
          router.push(`${basePath}/track/${data.customer.phone}`);
        }
      }
    } catch (err: any) {
      setError(err.message || "Sisteme girix yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const initial = firm.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Firm specific background styling */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-70 dark:opacity-40"></div>
      </div>

      <header className="relative z-20 p-4 sm:p-6 flex items-center justify-between">
        <Link href={basePath} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Ana Sayfaya Dön</span>
        </Link>
      </header>

      <main className="relative z-20 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Firm Logo */}
          <div className="text-center mb-8 flex flex-col items-center">
            <Link href={basePath} className="inline-flex items-center gap-3 mb-6 group cursor-pointer">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white overflow-hidden shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-500 flex-shrink-0">
                <span className="font-black text-2xl">{initial}</span>
                <div className="absolute inset-0 rounded-xl ring-1 ring-white/20 pointer-events-none"></div>
              </div>
              <div className="text-left flex flex-col justify-center">
                <span className="text-2xl font-bold tracking-tight text-foreground">{firm.name}</span>
                <p className="text-muted-foreground/60 text-[10px] uppercase tracking-[0.2em] font-bold mt-0.5">Müxteri Portalı</p>
              </div>
            </Link>
            <h1 className="text-3xl font-black text-foreground mb-2">Sisteme Girix</h1>
            <p className="text-muted-foreground text-sm">Siparixlerinizi ve detaylarınızı görmek için girix yapın.</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border-color">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                  E-Posta / Telefon
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="E-posta veya telefon numarası"
                    className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                  Şifre
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border-color rounded-xl pl-11 pr-12 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                  <span className="text-red-400">⚠</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg mt-2 touch-manipulation"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Girix Yapılıyor...
                  </span>
                ) : (
                  "Girix Yap"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Hesabınız yok mu?{" "}
                <Link href={`${basePath}/register`} className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Şimdi Kayıt Olun.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
