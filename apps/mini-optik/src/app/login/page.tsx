// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, User, Building } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedBackground } from "@/components/AnimatedBackground";


export default function SentientWireLoginPage() {
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



    // Yönetici/Firma Yetkilisi Girişi (Sentient Wire üzerinden)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: idVal, password: passVal }),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.redirectUrl || "/admin";
        return;
      } else {
        // Eğer yönetici değilse, müşteri girişi denemesi de yapabilir (Opsiyonel B2B müşterileri için)
        const customerRes = await fetch("/api/auth/customer-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: idVal, password: passVal }),
        });
        
        const data = await customerRes.json();

        if (!customerRes.ok) {
          throw new Error(data.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
        }

        if (data.success && data.customer?.phone) {
          if (data.requiresPasswordChange) {
            sessionStorage.setItem("tempCustomerId", data.customer.id);
            sessionStorage.setItem("tempCustomerPhone", data.customer.phone);
            sessionStorage.setItem("tempCustomerPassword", passVal);
            router.push("/change-password");
          } else {
            router.push(`/track/${data.customer.phone}`);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Sisteme giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
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
          {/* Generic Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
                <div className="text-white font-black text-3xl italic">P</div>
              </div>
              <div className="text-left flex flex-col justify-center">
                <p className="font-black text-foreground text-xl leading-none mb-1 tracking-tight">PEN <span className="text-primary">OPTİK</span></p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Sistemi</p>
              </div>
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">Sisteme Giriş</h1>
            <p className="text-muted-foreground text-sm">Gözlük bilgilerinizi ve siparişlerinizi takip etmek için giriş yapın.</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border-color">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identifier Field */}
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                  Telefon Numarası veya Kullanıcı Adı
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Telefon, TC veya e-posta"
                    className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
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

              {/* KVKK Checkbox removed (now handled in admin panel after login) */}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                  <span className="text-red-400">⚠</span> {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg mt-2 touch-manipulation"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Giriş Yapılıyor...
                  </span>
                ) : (
                  "Giriş Yap"
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-muted-foreground text-sm">
                Sisteme kayıtlı değil misiniz?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Kayıt Oluşturun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
