// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function PenOptikRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirm: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleaned = form.phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Geçerli bir telefon numarası girin.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("Şifreler eşleşmiyor. Lütfen şifrenizi doğru tekrarladığınızdan emin olun.");
      return;
    }
    setLoading(true);
    try {
      // Sentient Wire üzerinden kayıt olma işlemi (B2B SaaS Müşterisi)
      // Şimdilik demo amaçlı apiye istek atıyoruz
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız");
      
      router.push(`/login?registered=1`);
    } catch (err: any) {
      const errorMessage = err?.message ?? "Kayıt sırasında hata oluştu.";
      if (errorMessage.toLowerCase().includes("kayıtlı")) {
        setError("Bu hesap bulunmaktadır. Şubeyi arayarak geçici şifrenizi alabilirsiniz ve sisteme giriş yapabilirsiniz.");
      } else {
        setError(errorMessage);
      }
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

      <main className="relative z-20 flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-xl">
          <div className="bg-surface/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border-color">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="text-white font-black text-3xl italic">P</div>
                </div>
                <div className="text-left flex flex-col justify-center">
                  <p className="font-black text-foreground text-xl leading-none mb-1 tracking-tight">PEN <span className="text-primary">OPTİK</span></p>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Müşteri Kayıt</p>
                </div>
              </div>
              <h1 className="text-3xl font-black text-foreground mb-2">Aramıza Katılın</h1>
              <p className="text-muted-foreground text-sm">
                Gözlük bilgilerinizi ve siparişlerinizi takip etmek için kayıt olun.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">Ad *</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Adınız"
                    className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">Soyad *</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Soyadınız"
                    className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">E-Posta (İsteğe Bağlı)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ornek@mail.com"
                    className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">Telefon *</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0555 123 45 67"
                  className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">Şifre *</label>
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">Şifre Tekrar *</label>
                  <input
                    required
                    type="password"
                    value={form.passwordConfirm}
                    onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
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
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg mt-4 touch-manipulation"
              >
                {loading ? "Kaydediliyor..." : "Hesap Oluştur"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border-color text-center">
              <p className="text-muted-foreground text-sm">
                Zaten bir hesabınız var mı?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
