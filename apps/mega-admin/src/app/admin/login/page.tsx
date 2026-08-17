"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Fingerprint, ArrowRight, Activity, Terminal, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { InteractiveBackground } from "@/components/InteractiveBackground";

export default function SentientWireAdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Geçersiz xifre");
      }
    } catch (err) {
      setError("Bir bağlantı hatası oluxtu. Node ağını kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans text-white">
      
      {/* Dynamic Interactive Background */}
      <InteractiveBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-mono text-white/60">SYSTEM.SECURE_AUTH</span>
          </div>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/10 shadow-[0_0_80px_rgba(37,99,235,0.15)] relative overflow-hidden group">
          
          {/* Card internal gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

          <div className="text-center mb-10 relative">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10 flex items-center justify-center mx-auto mb-6 relative overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.2)]"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-xl"></div>
              <Fingerprint className="w-10 h-10 text-blue-400 relative z-10" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Workspace Access</h1>
            <p className="text-white/40 text-sm font-medium">Verify your identity to access the sentient console.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-xs font-mono text-white/50 flex items-center gap-2 uppercase tracking-wider ml-1">
                <Terminal className="w-3 h-3" />
                Auth Token / Password
              </label>
              <div className="relative group/input">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 opacity-0 group-focus-within/input:opacity-100 blur transition-opacity duration-500" style={{ padding: '1px' }}></div>
                <div className="relative flex items-center bg-[#111111] rounded-xl border border-white/10 group-focus-within/input:border-transparent transition-colors">
                  <Lock className="absolute left-4 w-5 h-5 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure key..."
                    className="w-full bg-transparent px-12 py-4 text-white placeholder-white/20 focus:outline-none rounded-xl"
                    autoFocus
                  />
                </div>
              </div>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
                >
                  <Activity className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group/btn disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur opacity-70 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white py-4 rounded-xl font-bold text-lg transition-transform active:scale-[0.98] shadow-lg border border-white/20">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    Initialize Session
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-white/30 text-xs font-mono">
            <Shield className="w-3 h-3" />
            End-to-end encrypted connection
          </div>
        </div>
      </motion.div>
    </div>
  );
}
