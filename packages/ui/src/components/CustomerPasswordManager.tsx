// @ts-nocheck
"use client";

import { useState } from "react";
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    hasLoggedBefore?: boolean;
    isPasswordTemporary?: boolean;
    tempPasswordExpires?: string;
    tempPasswordPlain?: string | null;
  };
};

export default function CustomerPasswordManager({ customer }: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdatePassword = async (newVal: string, isReset = false) => {
    if (!newVal || newVal.trim() === "") {
      setErrorMsg("Şifre boş olamaz.");
      return;
    }
    if (!isReset && newVal.trim().length < 6) {
      setErrorMsg("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    const toastId = toast.loading("Şifre güncelleniyor...");
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          password: newVal.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Şifre güncellenemedi.");

      const msg = isReset ? "Şifre başarıyla varsayılana sıfırlandı." : "Şifre başarıyla güncellendi.";
      setSuccessMsg(msg);
      toast.success(msg, { id: toastId });
      setPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Bir hata oluştu.");
      toast.error("Hata: " + (err.message || "Bir hata oluştu."), { id: toastId });
    } finally {
      setLoading(false);
    }
  };
  const handleGeneratePin = async () => {
    const toastId = toast.loading("Geçici şifre oluşturuluyor...");
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/customers/${customer.id}/reset-password`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Şifre sıfırlanamadı.");
      
      setSuccessMsg(`Geçici şifre oluşturuldu: ${data.generatedPassword}`);
      toast.success("Geçici şifre oluşturuldu!", { id: toastId });
      alert(`MÜŞTERİYE VERİLECEK GEÇİCİ ŞİFRE:\n\n${data.generatedPassword}\n\nLütfen bu şifreyi müşteriye iletin.`);
    } catch (err: any) {
      setErrorMsg(err.message || "Bir hata oluştu.");
      toast.error("Hata: " + (err.message || "Bir hata oluştu."), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass rounded-2xl p-6 border border-border-color space-y-5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-foreground font-bold flex items-center justify-between mb-2 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" /> Hesap & Şifre Yönetimi
        </div>
        <span className="text-muted-foreground text-xs">
          {isOpen ? "Gizle" : "Göster"}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-5 pt-2">

      <div className="bg-surface/50 rounded-xl p-4 border border-border-color space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground font-medium">Giriş Kimliği (Telefon):</span>
          <span className="text-foreground font-bold font-mono">{customer.phone}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm border-t border-border-color/50 pt-3">
          <span className="text-muted-foreground font-medium">Hesap Aktivitesi:</span>
          {customer.hasLoggedBefore ? (
            <span className="text-emerald-500 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <CheckCircle className="w-3.5 h-3.5" /> Aktif (Giriş Yapıldı)
            </span>
          ) : (
            <span className="text-amber-500 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md">
              <AlertCircle className="w-3.5 h-3.5" /> Hiç Giriş Yapılmadı
            </span>
          )}
        </div>
        <div className="flex justify-between items-center text-sm border-t border-border-color/50 pt-3">
          <span className="text-muted-foreground font-medium">Şifre Durumu:</span>
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Güvenli Kriptolanmış (Bcrypt)
          </span>
        </div>
        
        {customer.isPasswordTemporary && customer.tempPasswordPlain && customer.tempPasswordExpires && new Date(customer.tempPasswordExpires) > new Date() && (
          <div className="mt-3 text-sm leading-relaxed text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
            <div className="flex items-start gap-2 mb-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <strong>Müşteriye İletilecek Geçici Şifre:</strong>
            </div>
            <p className="font-mono text-xl text-center font-black my-2">{customer.tempPasswordPlain}</p>
            <p className="text-xs opacity-80 mt-1">Bu geçici şifre {new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(customer.tempPasswordExpires))} tarihine kadar geçerlidir.</p>
          </div>
        )}

        <div className="mt-2 text-[11px] leading-relaxed text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex gap-2 items-start">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="font-bold">Önemli Not:</strong> Sistem güvenliği ve KVKK gereği şifreler "tek yönlü" (Bcrypt) olarak şifrelenir ve veri tabanında geri döndürülemez şekilde saklanır. <strong>Bu nedenle anlık şifre metninin gösterimi teknik olarak imkansızdır.</strong> Müşteri şifresini unuttuysa aşağıdan yeni bir şifre belirleyebilir veya varsayılana (telefon numarası) sıfırlayabilirsiniz.
          </p>
        </div>
      </div>

      {/* Inputs & Actions */}
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
            Yeni Şifre Belirle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Key className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter girin"
              className="w-full bg-surface border border-border-color rounded-xl pl-10 pr-10 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex gap-2 flex-col sm:flex-row pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpdatePassword(password)}
            className="flex-1 gradient-primary text-[#1B242A] py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Key className="w-3.5 h-3.5" />
            )}
            Yeni Şifreyi Kaydet
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={handleGeneratePin}
            className="flex-1 glass border border-border-color hover:border-primary/40 text-muted-foreground hover:text-foreground py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Geçici Şifre (PIN) Üret
          </button>
        </div>
        </div>
        </div>
      )}
    </div>
  );
}
