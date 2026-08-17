// @ts-nocheck
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Key, Eye, EyeOff, Loader2 } from "lucide-react";

function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customerId, setCustomerId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlId = searchParams.get("id");
    const urlPhone = searchParams.get("phone");

    const id = sessionStorage.getItem("tempCustomerId") || urlId;
    const phone = sessionStorage.getItem("tempCustomerPhone") || urlPhone;
    const temp = sessionStorage.getItem("tempCustomerPassword");

    if (!id) {
      router.push("/login"); // Güvenlik: Kimlik bilgisi yoksa login'e geri at.
      return;
    }

    setCustomerId(id);
    setCustomerPhone(phone || "");
    if (temp) setTempPassword(temp);
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Yeni şifreniz en az 6 karakter olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    if (newPassword === tempPassword) {
      setError("Yeni şifreniz geçici şifrenizle aynı olamaz.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          tempPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Şifre değiştirilemedi.");

      // Temizle
      sessionStorage.removeItem("tempCustomerId");
      sessionStorage.removeItem("tempCustomerPhone");
      sessionStorage.removeItem("tempCustomerPassword");

      // Başarılı giriş: Takip sayfasına at
      router.push(`/track/${customerPhone}`);

    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!customerId) return <div className="min-h-screen bg-background" />; // Hide until loaded

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 mb-4">
            <Key className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Şifrenizi Belirleyin</h1>
          <p className="text-muted-foreground text-sm">
            Güvenliğiniz için lütfen geçici şifrenizi kalıcı ve güvenli bir şifreyle değiştirin.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl border border-border-color">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border-color rounded-xl px-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border-color rounded-xl px-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

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
              className="w-full gradient-primary text-[#1B242A] py-4 rounded-xl font-black text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 glow-primary mt-2 touch-manipulation flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Kaydediliyor..." : "Şifremi Kaydet ve Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ChangePasswordForm />
    </Suspense>
  );
}
