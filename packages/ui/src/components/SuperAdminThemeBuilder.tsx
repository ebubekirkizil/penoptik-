// @ts-nocheck
"use client";

import { useState } from "react";
import { Loader2, Monitor, Sun, Moon, Copy, Server, Laptop, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import ThemeInjector, { ThemeColors } from "./ThemeInjector";
import { LIGHT_PRESETS, DARK_PRESETS, DEFAULT_THEME, ScopeType } from "./SettingsForm";

function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate" title={label}>{label}</label>
      <div className="flex items-center gap-2">
        <input 
          type="color" 
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 shadow-sm flex-shrink-0 bg-transparent"
        />
        <input 
          type="text" 
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-2 py-1.5 bg-background border border-border-color rounded-md text-xs font-mono outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

export default function SuperAdminThemeBuilder({ 
  initialThemes, 
  onSave 
}: { 
  initialThemes?: any,
  onSave: (themes: any) => Promise<void> 
}) {
  const [saving, setSaving] = useState(false);
  const [scope, setScope] = useState<ScopeType>("admin");
  const [themes, setThemes] = useState<{ [key in ScopeType]: ThemeColors }>(() => {
    if (initialThemes && Object.keys(initialThemes).length > 0) {
      return {
        admin: { ...DEFAULT_THEME, ...initialThemes.admin },
        customer: { ...DEFAULT_THEME, ...initialThemes.customer },
        login: { ...DEFAULT_THEME, ...initialThemes.login },
      };
    }
    return {
      admin: { ...DEFAULT_THEME },
      customer: { ...DEFAULT_THEME },
      login: { ...DEFAULT_THEME },
    };
  });

  const handleColorChange = (field: string, value: string) => {
    setThemes(prev => ({
      ...prev,
      [scope]: { ...prev[scope], [field]: value }
    }));
  };

  const applyPreset = (mode: "light" | "dark", presetIndex: number) => {
    const preset = mode === "light" ? LIGHT_PRESETS[presetIndex].colors : DARK_PRESETS[presetIndex].colors;
    const newColors = {
      [`${mode}Primary`]: preset.primary,
      [`${mode}Secondary`]: preset.secondary,
      [`${mode}Background`]: preset.background,
      [`${mode}Surface`]: preset.surface,
      [`${mode}Foreground`]: preset.foreground,
      [`${mode}MutedForeground`]: preset.mutedForeground,
      [`${mode}Border`]: preset.border,
      [`${mode}Chart1`]: preset.chart1,
      [`${mode}Chart2`]: preset.chart2,
      [`${mode}Warning`]: preset.warning,
      [`${mode}Success`]: preset.success,
      [`${mode}Danger`]: preset.danger,
    };
    
    setThemes(prev => ({
      ...prev,
      [scope]: { ...prev[scope], ...newColors }
    }));
  };

  const applyToAll = () => {
    const currentTheme = themes[scope];
    setThemes({
      admin: { ...currentTheme },
      customer: { ...currentTheme },
      login: { ...currentTheme }
    });
    toast.success("Seçili renkler diğer sayfalara kopyalandı!");
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await onSave(themes);
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const currentColors = themes[scope];

  return (
    <div className="bg-white dark:bg-surface shadow-sm rounded-3xl overflow-hidden border border-border-color relative animate-in fade-in duration-300">
      
      {/* CANLI ÖNİZLEME (LIVE PREVIEW) INJECTOR */}
      <ThemeInjector theme={currentColors} />

      <div className="p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50 border border-border-color p-4 rounded-2xl">
          <div>
            <h3 className="text-sm font-bold text-foreground">Hangi Sayfayı Düzenliyorsunuz?</h3>
            <p className="text-xs text-muted-foreground mt-1">Müşterinin admin paneli, e-ticaret vitrini veya login ekranı için farklı renkler belirleyebilirsiniz.</p>
          </div>
          
          <div className="flex bg-background border border-border-color rounded-xl p-1 shrink-0">
            <button onClick={() => setScope("admin")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${scope === "admin" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface"}`}>
              <Server className="w-3.5 h-3.5" /> Admin Panel
            </button>
            <button onClick={() => setScope("customer")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${scope === "customer" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface"}`}>
              <Monitor className="w-3.5 h-3.5" /> E-Ticaret
            </button>
            <button onClick={() => setScope("login")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${scope === "login" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface"}`}>
              <Laptop className="w-3.5 h-3.5" /> Login Ekranı
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={applyToAll} className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
            <Copy className="w-3.5 h-3.5" /> Bu Sayfanın Renklerini Tüm Sayfalara Kopyala
          </button>
        </div>

        <div className="space-y-8 animate-fade-in">
            {/* Light Mode Colors */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" /> Aydınlık Mod Renkleri
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {LIGHT_PRESETS.map((preset, idx) => (
                  <button key={idx} onClick={() => applyPreset("light", idx)} className="p-3 text-left border border-border-color rounded-xl hover:border-primary/50 transition-all group">
                    <p className="text-xs font-bold text-foreground mb-2 group-hover:text-primary">{preset.name}</p>
                    <div className="flex h-6 rounded-lg overflow-hidden border border-border-color/50">
                      <div className="flex-1" style={{ backgroundColor: preset.colors.primary }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.colors.background }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.colors.surface }}></div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-border-color rounded-xl bg-slate-50 dark:bg-surface/20">
                <ColorPicker label="Ana Vurgu Rengi" value={currentColors.lightPrimary || ""} onChange={(v) => handleColorChange("lightPrimary", v)} />
                <ColorPicker label="İkincil Vurgu" value={currentColors.lightSecondary || ""} onChange={(v) => handleColorChange("lightSecondary", v)} />
                <ColorPicker label="Ana Arka Plan" value={currentColors.lightBackground || ""} onChange={(v) => handleColorChange("lightBackground", v)} />
                <ColorPicker label="Kart (Kutu) Zemini" value={currentColors.lightSurface || ""} onChange={(v) => handleColorChange("lightSurface", v)} />
                
                <ColorPicker label="Ana Metin Rengi" value={currentColors.lightForeground || ""} onChange={(v) => handleColorChange("lightForeground", v)} />
                <ColorPicker label="Soluk Metin Rengi" value={currentColors.lightMutedForeground || ""} onChange={(v) => handleColorChange("lightMutedForeground", v)} />
                <ColorPicker label="Çerçeve / Çizgi Rengi" value={currentColors.lightBorder || ""} onChange={(v) => handleColorChange("lightBorder", v)} />

                <ColorPicker label="Grafik 1" value={currentColors.lightChart1 || ""} onChange={(v) => handleColorChange("lightChart1", v)} />
                <ColorPicker label="Grafik 2" value={currentColors.lightChart2 || ""} onChange={(v) => handleColorChange("lightChart2", v)} />
                <ColorPicker label="Uyarı" value={currentColors.lightWarning || ""} onChange={(v) => handleColorChange("lightWarning", v)} />
                <ColorPicker label="Başarı" value={currentColors.lightSuccess || ""} onChange={(v) => handleColorChange("lightSuccess", v)} />
                <ColorPicker label="Hata" value={currentColors.lightDanger || ""} onChange={(v) => handleColorChange("lightDanger", v)} />
              </div>
            </div>

            {/* Dark Mode Colors */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-400" /> Koyu Mod Renkleri
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {DARK_PRESETS.map((preset, idx) => (
                  <button key={idx} onClick={() => applyPreset("dark", idx)} className="p-3 text-left border border-border-color rounded-xl hover:border-primary/50 transition-all group">
                    <p className="text-xs font-bold text-foreground mb-2 group-hover:text-primary">{preset.name}</p>
                    <div className="flex h-6 rounded-lg overflow-hidden border border-border-color/50">
                      <div className="flex-1" style={{ backgroundColor: preset.colors.primary }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.colors.background }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.colors.surface }}></div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-border-color rounded-xl bg-slate-50 dark:bg-surface/20">
                <ColorPicker label="Ana Vurgu Rengi" value={currentColors.darkPrimary || ""} onChange={(v) => handleColorChange("darkPrimary", v)} />
                <ColorPicker label="İkincil Vurgu" value={currentColors.darkSecondary || ""} onChange={(v) => handleColorChange("darkSecondary", v)} />
                <ColorPicker label="Ana Arka Plan" value={currentColors.darkBackground || ""} onChange={(v) => handleColorChange("darkBackground", v)} />
                <ColorPicker label="Kart (Kutu) Zemini" value={currentColors.darkSurface || ""} onChange={(v) => handleColorChange("darkSurface", v)} />
                
                <ColorPicker label="Ana Metin Rengi" value={currentColors.darkForeground || ""} onChange={(v) => handleColorChange("darkForeground", v)} />
                <ColorPicker label="Soluk Metin Rengi" value={currentColors.darkMutedForeground || ""} onChange={(v) => handleColorChange("darkMutedForeground", v)} />
                <ColorPicker label="Çerçeve / Çizgi Rengi" value={currentColors.darkBorder || ""} onChange={(v) => handleColorChange("darkBorder", v)} />

                <ColorPicker label="Grafik 1" value={currentColors.darkChart1 || ""} onChange={(v) => handleColorChange("darkChart1", v)} />
                <ColorPicker label="Grafik 2" value={currentColors.darkChart2 || ""} onChange={(v) => handleColorChange("darkChart2", v)} />
                <ColorPicker label="Uyarı" value={currentColors.darkWarning || ""} onChange={(v) => handleColorChange("darkWarning", v)} />
                <ColorPicker label="Başarı" value={currentColors.darkSuccess || ""} onChange={(v) => handleColorChange("darkSuccess", v)} />
                <ColorPicker label="Hata" value={currentColors.darkDanger || ""} onChange={(v) => handleColorChange("darkDanger", v)} />
              </div>
            </div>
            
            <button 
              onClick={saveSettings} 
              disabled={saving}
              className="w-full py-4 mt-8 bg-primary text-primary-foreground rounded-xl font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
              Tema Ayarlarını Canlıya Al
            </button>
        </div>
      </div>
    </div>
  );
}
