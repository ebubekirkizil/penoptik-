"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";

type FirmData = {
  name: string;
  domain: string | null;
};

export function FirmTrackClient({ firm, basePath }: { firm: FirmData, basePath: string }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Lütfen geçerli bir telefon numarası girin.");
      return;
    }
    setLoading(true);
    setError("");
    // Navigate to results with phone
    router.push(`${basePath}/track/${cleaned}`);
  };

  const initial = firm.name.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen gradient-hero flex flex-col">
      <header className="bg-white dark:bg-surface shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={basePath} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg flex-shrink-0 transition-transform group-hover:scale-110">
              {initial}
            </div>
            <span className="font-black text-lg tracking-tight text-foreground leading-none flex flex-col justify-center">{firm.name}</span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-surface shadow-sm rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary">
                <Search className="w-8 h-8 text-[#1B242A]" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Siparix Takip</h1>
              <p className="text-muted-foreground text-sm">
                Telefon numaranızı girin, siparixinizi anlık olarak görün.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2 font-medium">
                  Telefon Numaranız
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0555 123 45 67"
                  className="w-full bg-white dark:bg-surface rounded-xl px-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
                  inputMode="numeric"
                  autoComplete="tel"
                />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-[#1B242A] py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100 glow-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Aranıyor...
                  </span>
                ) : (
                  "Sipariximi Göster"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Hesabınız yok mu?{" "}
                <Link href={`${basePath}/register`} className="text-primary hover:text-foreground font-medium transition-colors">
                  Kayıt Olun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
