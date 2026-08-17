"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, User, Mail, Phone, Building } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { superAdminLoginAction } from "@/app/login/actions";

import Image from "next/image";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { motion, AnimatePresence } from "framer-motion";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Register State
  const [regForm, setRegForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });

  const handleGoogleLogin = (credentialResponse: any) => {
    if (!credentialResponse?.credential) return;

    setLoading(true);
    setError("");

    // Use native form POST submit to combine Set-Cookie and HTTP 307 Redirect natively
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/google-login";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "credential";
    input.value = credentialResponse.credential;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const idVal = identifier.trim();
    const passVal = password.trim();

    if (idVal === "0551" && passVal === "1453") {
      try {
        const formData = new FormData();
        formData.append("username", idVal);
        formData.append("password", passVal);
        await superAdminLoginAction(formData);
        return;
      } catch (err: any) {
        setError(err.message || "Mega Admin girixi baxarısız.");
        setLoading(false);
        return;
      }
    }

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
            router.push("/change-password");
          } else {
            router.push(`/track/${data.customer.phone}`);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Sisteme girix yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const cleanedPhone = regForm.phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      setError("Geçerli bir telefon numarası girin.");
      return;
    }
    if (regForm.password !== regForm.passwordConfirm) {
      setError("Şifreler exlexmiyor. Lütfen xifrenizi doğru tekrarladığınızdan emin olun.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...regForm, phone: cleanedPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt baxarısız");
      
      setSuccess("Hesabınız baxarıyla oluxturuldu! Lütfen girix yapın.");
      setActiveTab("login");
      setIdentifier(regForm.email);
    } catch (err: any) {
      setError(err?.message ?? "Kayıt sırasında hata oluxtu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8 flex flex-col items-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-6 group cursor-pointer">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-black overflow-hidden shadow-lg shadow-black/20 group-hover:shadow-black/40 transition-all duration-500 flex-shrink-0">
            <Image src="/logo.png" alt="Sentient Wire Logo" fill className="object-cover" />
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/20 pointer-events-none"></div>
          </div>
          <div className="text-left flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">Sentient</span>
              <span className="text-2xl font-medium text-muted-foreground tracking-tight">Wire</span>
            </div>
            <p className="text-muted-foreground/60 text-[10px] uppercase tracking-[0.2em] font-bold mt-0.5">Yönetim Portalı</p>
          </div>
        </Link>
        <h1 className="text-3xl font-black text-foreground mb-2">Hox Geldiniz</h1>
        <p className="text-muted-foreground text-sm">Sentient Wire ekosistemine erixmek için girix yapın veya yeni bir hesap oluxturun.</p>
      </div>

      <div className="bg-surface/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-color overflow-hidden relative">
        
        {/* Toggle Switch */}
        <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl mb-8 relative">
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-800 shadow-sm rounded-xl"
            initial={false}
            animate={{ left: activeTab === "login" ? "4px" : "calc(50%)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button
            onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
            className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${activeTab === "login" ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            Girix Yap
          </button>
          <button
            onClick={() => { setActiveTab("register"); setError(""); setSuccess(""); }}
            className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${activeTab === "register" ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            Hesap Aç
          </button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-3 text-sm flex items-center gap-2 mb-6">
            <span className="text-red-400">⚠</span> {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl px-4 py-3 text-sm flex items-center gap-2 mb-6">
            <span className="text-emerald-400">✓</span> {success}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLoginSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">E-Posta / Telefon</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="E-posta veya telefon numarası" className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Şifre</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-background border border-border-color rounded-xl pl-11 pr-12 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-foreground text-background py-4 rounded-xl font-black text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg mt-2 touch-manipulation">
                {loading ? "Girix Yapılıyor..." : "Girix Yap"}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Ad</label>
                  <input required value={regForm.firstName} onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })} placeholder="Adınız" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Soyad</label>
                  <input required value={regForm.lastName} onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })} placeholder="Soyadınız" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">E-Posta</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input required type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} placeholder="ornek@firma.com" className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input required type="tel" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} placeholder="0555 123 45 67" className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Şifre</label>
                  <input required type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} placeholder="••••••••" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Şifre Tekrar</label>
                  <input required type="password" value={regForm.passwordConfirm} onChange={(e) => setRegForm({ ...regForm, passwordConfirm: e.target.value })} placeholder="••••••••" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-base transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 shadow-lg mt-2 touch-manipulation">
                {loading ? "Hesap Oluxturuluyor..." : "Kayıt Ol"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-color"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-surface text-muted-foreground font-medium uppercase tracking-wider text-xs">Veya</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google ile ixlem baxarısız oldu.")}
            theme="outline"
            size="large"
            text={activeTab === "login" ? "signin_with" : "signup_with"}
            shape="pill"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}

export default function SentientWireLoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "mock-client-id.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        {/* Dynamic Interactive Background */}
        <InteractiveBackground />

        <header className="relative z-20 p-4 sm:p-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <ThemeToggle />
        </header>

        <main className="relative z-20 flex-1 flex items-center justify-center p-4">
          <Suspense fallback={<div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto"></div>}>
            <AuthForm />
          </Suspense>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}
