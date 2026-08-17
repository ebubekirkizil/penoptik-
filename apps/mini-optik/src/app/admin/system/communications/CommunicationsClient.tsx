"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Send, Settings, BookOpen, Clock, Loader2, Plus, MessageSquare, Search,
  CheckSquare, CheckCircle2, AlertCircle, Phone, ArrowRight, Sparkles,
  Mail, Smartphone, Info, Zap, ToggleLeft, ToggleRight, AlertTriangle, X, Pencil, Save,
  Link2
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const TRIGGER_LABELS: Record<string, string> = {
  ORDER_CREATED: "✨ Yeni Sipariş Oluşturulduğunda",
  ORDER_READY: "📦 Sipariş Hazır (READY) Olduğunda",
  ORDER_DELIVERED: "✅ Sipariş Teslim Edildiğinde",
};

const CHANNEL_INFO = {
  SMS: { icon: MessageSquare, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/30", label: "SMS", needsPhone: true, needsEmail: false },
  WHATSAPP: { icon: Smartphone, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "WhatsApp", needsPhone: true, needsEmail: false },
  EMAIL: { icon: Mail, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "E-posta", needsPhone: false, needsEmail: true },
};

export default function CommunicationsClient() {
  const [activeTab, setActiveTab] = useState("send");
  const [customers, setCustomers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Send message states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["SMS"]);
  // Per-channel template & custom message
  const [channelTemplates, setChannelTemplates] = useState<Record<string, string>>({}); // channel -> templateId
  const [channelMessages, setChannelMessages]   = useState<Record<string, string>>({}); // channel -> custom text
  const [channelSubjects, setChannelSubjects]   = useState<Record<string, string>>({}); // channel -> email subject (for custom message mode)

  // Template form states
  const [templateType, setTemplateType] = useState("SMS");

  // Edit modal state
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  // Automation form states (visual builder)
  const [autoName, setAutoName] = useState("");
  const [autoTrigger, setAutoTrigger] = useState("ORDER_READY");
  const [autoTemplateId, setAutoTemplateId] = useState("");
  const [autoDelay, setAutoDelay] = useState("0");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "send") {
        const [cRes, tRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/admin/communications/templates")
        ]);
        const cData = await cRes.json();
        const tData = await tRes.json();
        setCustomers(Array.isArray(cData) ? cData : []);
        setTemplates(Array.isArray(tData) ? tData : []);
      } else if (activeTab === "templates") {
        const res = await fetch("/api/admin/communications/templates");
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      } else if (activeTab === "automations") {
        const [aRes, tRes] = await Promise.all([
          fetch("/api/admin/communications/automations"),
          fetch("/api/admin/communications/templates")
        ]);
        const aData = await aRes.json();
        const tData = await tRes.json();
        setAutomations(Array.isArray(aData) ? aData : []);
        setTemplates(Array.isArray(tData) ? tData : []);
      } else if (activeTab === "logs") {
        const res = await fetch("/api/admin/communications/logs");
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      toast.error("Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const searchStr = `${c.firstName} ${c.lastName} ${c.phone || ""}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [customers, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const getCustomerMissingInfo = (c: any) => {
    const missing = [];
    if (!c.phone) missing.push("Telefon");
    if (!c.email) missing.push("E-posta");
    return missing;
  };

  const handleSendMessage = async () => {
    if (selectedCustomers.length === 0) return toast.error("Lütfen en az bir müşteri seçin.");
    if (selectedChannels.length === 0) return toast.error("Lütfen en az bir kanal seçin.");

    // Build per-channel config
    const channelConfigs = selectedChannels.map(ch => ({
      channel: ch,
      templateId: channelTemplates[ch] || null,
      customMessage: channelMessages[ch] || null,
      emailSubject: channelSubjects[ch] || null,
    }));

    // Validate: each channel needs either a template or a custom message
    for (const cfg of channelConfigs) {
      if (!cfg.templateId && !cfg.customMessage) {
        return toast.error(`${cfg.channel} kanalı için bir şablon seçin veya mesaj yazın.`);
      }
      if (cfg.channel === "EMAIL" && !cfg.templateId && !cfg.emailSubject) {
        return toast.error("E-posta için konu başlığı zorunludur.");
      }
    }

    const promise = fetch("/api/admin/communications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerIds: selectedCustomers, channelConfigs })
    }).then(async res => {
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gönderim başarısız"); }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Mesajlar işleniyor...",
      success: (data) => `${data.sent} mesaj gönderildi${data.skipped > 0 ? `, ${data.skipped} kişi eksik bilgi nedeniyle atlandı` : ""}.`,
      error: (err) => err.message
    });

    try {
      await promise;
      setSelectedCustomers([]);
      setChannelTemplates({});
      setChannelMessages({});
      setChannelSubjects({});
    } catch (error) { }
  };

  const createTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const res = await fetch("/api/admin/communications/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          type: formData.get("type"),
          subject: formData.get("subject"),
          content: formData.get("content"),
        })
      });
      if (res.ok) {
        toast.success("Şablon oluşturuldu.");
        (e.target as HTMLFormElement).reset();
        setTemplateType("SMS");
        fetchData();
      } else toast.error("Şablon oluşturulamadı.");
    } catch (err) { toast.error("Bir hata oluştu."); }
  };

  const createAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoTrigger || !autoTemplateId) return toast.error("Tetikleyici ve şablon seçilmelidir.");
    try {
      const res = await fetch("/api/admin/communications/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: autoName || TRIGGER_LABELS[autoTrigger]?.replace(/^[^a-zA-Z]+ /, "") || autoTrigger,
          trigger: autoTrigger,
          templateId: autoTemplateId,
        })
      });
      if (res.ok) {
        toast.success("Otomasyon kuralı oluşturuldu!");
        setAutoName("");
        setAutoTrigger("ORDER_READY");
        setAutoTemplateId("");
        setAutoDelay("0");
        fetchData();
      } else toast.error("Otomasyon kuralı oluşturulamadı.");
    } catch (err) { toast.error("Bir hata oluştu."); }
  };

  const toggleAutomation = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch("/api/admin/communications/automations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentState })
      });
      if (res.ok) {
        toast.success(currentState ? "Otomasyon durduruldu." : "Otomasyon etkinleştirildi.");
        fetchData();
      } else toast.error("Durum güncellenemedi.");
    } catch { toast.error("Bir hata oluştu."); }
  };

  const deleteAutomation = async (id: string) => {
    if (!confirm("Bu otomasyon kuralını silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/communications/automations?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Otomasyon silindi."); fetchData(); }
      else toast.error("Silinemedi.");
    } catch { toast.error("Bir hata oluştu."); }
  };

  const loadSeedTemplates = async () => {
    try {
      const res = await fetch("/api/admin/communications/templates/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.count} örnek şablon başarıyla yüklendi!`);
        fetchData();
      } else {
        toast.error(data.error || "Yüklenemedi.");
      }
    } catch { toast.error("Bir hata oluştu."); }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Bu şablonu silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/communications/templates?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Şablon silindi."); fetchData(); }
      else toast.error("Silinemedi.");
    } catch { toast.error("Bir hata oluştu."); }
  };

  const updateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const res = await fetch("/api/admin/communications/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTemplate.id,
          name: formData.get("name"),
          type: formData.get("type"),
          subject: formData.get("subject"),
          content: formData.get("content"),
        }),
      });
      if (res.ok) {
        toast.success("Şablon güncellendi.");
        setEditingTemplate(null);
        fetchData();
      } else {
        toast.error("Şablon güncellenemedi.");
      }
    } catch { toast.error("Bir hata oluştu."); }
  };

  return (
    <div className="bg-surface/50 border border-[var(--border-color)] rounded-3xl shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[700px] backdrop-blur-xl relative">

      {/* Sidebar Navigation */}
      <div className="w-full lg:w-72 bg-black/5 dark:bg-white/5 border-b lg:border-b-0 lg:border-r border-[var(--border-color)] p-6 flex flex-col gap-2 relative z-10">
        <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider mb-2 ml-2">Modüller</h3>

        <button onClick={() => setActiveTab("send")} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === "send" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground hover:scale-[1.02]"}`}>
          <Send className="w-4 h-4" /> Anlık Mesaj
        </button>
        <button onClick={() => setActiveTab("templates")} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === "templates" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground hover:scale-[1.02]"}`}>
          <BookOpen className="w-4 h-4" /> Hazır Şablonlar
        </button>
        <button onClick={() => setActiveTab("automations")} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === "automations" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground hover:scale-[1.02]"}`}>
          <Settings className="w-4 h-4" /> Akıllı Otomasyon
        </button>
        <button onClick={() => setActiveTab("logs")} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === "logs" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground hover:scale-[1.02]"}`}>
          <Clock className="w-4 h-4" /> İletişim Geçmişi
        </button>

        <button onClick={() => setActiveTab("integrations")} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === "integrations" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground hover:scale-[1.02]"}`}>
          <Link2 className="w-4 h-4" /> Bağlantılar
        </button>

        {/* Integration Info Box */}
        <div className="mt-auto pt-4 border-t border-[var(--border-color)]">
          <button onClick={() => setActiveTab("integrations")} className="w-full bg-amber-500/10 hover:bg-amber-500/20 transition-colors border border-amber-500/20 rounded-2xl p-4 text-left text-xs space-y-2 group">
            <div className="flex items-center justify-between font-black text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Entegrasyon Gerekli
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Gerçek mesaj gönderimi için SMS veya WhatsApp API sağlayıcınızı bağlayın.
            </p>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto relative z-10">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* SEND MESSAGE TAB */}
            {activeTab === "send" && (
              <div className="h-full flex flex-col max-w-5xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                    <MessageSquare className="w-7 h-7 text-primary" />
                    Yeni Mesaj Oluştur
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">Müşterilerinize SMS, WhatsApp veya E-posta kanallarıyla <strong>aynı anda birden fazla</strong> kanal üzerinden toplu mesajlar gönderin.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 flex-1">
                  {/* Left Column: Customer Selection */}
                  <div className="flex flex-col h-full bg-background border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[var(--border-color)] bg-surface/50 backdrop-blur-md sticky top-0 z-20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">Alıcıları Seçin ({selectedCustomers.length} seçildi)</span>
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                          <CheckSquare className="w-4 h-4" />
                          {selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 ? "Tümünü Kaldır" : "Tümünü Seç"}
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="İsim veya telefon numarası ara..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-background border border-[var(--border-color)] pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 max-h-[350px]">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">Müşteri bulunamadı.</div>
                      ) : (
                        <div className="space-y-1">
                          {filteredCustomers.map((c: any) => {
                            const isSelected = selectedCustomers.includes(c.id);
                            const missing = getCustomerMissingInfo(c);
                            const hasMissing = missing.length > 0;
                            return (
                              <label
                                key={c.id}
                                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${isSelected ? "bg-primary/5 border-primary/30" : "hover:bg-black/5 dark:hover:bg-white/5 border-transparent"}`}
                                onClick={() => {
                                  setSelectedCustomers(prev =>
                                    prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                                  );
                                }}
                              >
                                <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${isSelected ? "bg-primary border-primary text-white" : "border-[var(--border-color)]"}`}>
                                  {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`font-bold text-sm truncate ${isSelected ? "text-primary" : "text-foreground"}`}>{c.firstName} {c.lastName}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                    <Phone className="w-3 h-3 flex-shrink-0" />
                                    <span>{c.phone || <span className="text-red-400 font-medium">Telefon yok</span>}</span>
                                    {c.email && <Mail className="w-3 h-3 flex-shrink-0" />}
                                  </div>
                                </div>
                                {hasMissing && (
                                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold flex-shrink-0" title={`${missing.join(", ")} eksik`}>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Per-Channel Message Composition */}
                  <div className="flex flex-col gap-5">
                    {/* Channel Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        Kanal Seçimi
                        <span className="text-xs text-muted-foreground font-normal">(Birden fazla seçebilirsiniz)</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(Object.entries(CHANNEL_INFO) as [string, any][]).map(([key, info]) => {
                          const Icon = info.icon;
                          const isActive = selectedChannels.includes(key);
                          return (
                            <button
                              key={key}
                              onClick={() => toggleChannel(key)}
                              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all relative ${isActive ? `border-primary bg-primary/5 text-primary` : "border-[var(--border-color)] bg-background text-muted-foreground hover:bg-surface"}`}
                            >
                              {isActive && (
                                <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                                  <CheckSquare className="w-2.5 h-2.5 text-primary-foreground" />
                                </div>
                              )}
                              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : info.color}`} />
                              <span className="text-xs font-bold">{info.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {/* Missing info warning */}
                      {selectedCustomers.length > 0 && selectedChannels.length > 0 && (() => {
                        const phoneNeeded = selectedChannels.some(ch => ch === "SMS" || ch === "WHATSAPP");
                        const emailNeeded = selectedChannels.includes("EMAIL");
                        const noPhone = phoneNeeded ? customers.filter(c => selectedCustomers.includes(c.id) && !c.phone).length : 0;
                        const noEmail = emailNeeded ? customers.filter(c => selectedCustomers.includes(c.id) && !c.email).length : 0;
                        if (noPhone === 0 && noEmail === 0) return null;
                        return (
                          <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>
                              {noPhone > 0 && <>{noPhone} müşteride telefon numarası eksik.</>}
                              {noPhone > 0 && noEmail > 0 && " "}
                              {noEmail > 0 && <>{noEmail} müşteride e-posta adresi eksik.</>}
                              {" "}Eksik bilgisi olanlar otomatik atlanır.
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Per-Channel Template Cards */}
                    {selectedChannels.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-sm font-bold block">
                          {selectedChannels.length > 1 ? "Kanal Başına Şablon" : "Şablon Seç"}
                        </label>
                        {(Object.entries(CHANNEL_INFO) as [string, any][]).map(([chKey, chInfo]) => {
                          if (!selectedChannels.includes(chKey)) return null;
                          const Icon = chInfo.icon;
                          const selectedTplId = channelTemplates[chKey] || "";
                          const selectedTpl = templates.find((t: any) => t.id === selectedTplId);
                          // For this channel, only show matching type templates + all types as fallback
                          const relevantTemplates = templates.filter((t: any) => t.type === chKey);
                          const otherTemplates = templates.filter((t: any) => t.type !== chKey);
                          const customMsg = channelMessages[chKey] || "";

                          return (
                            <div key={chKey} className={`rounded-2xl border-2 overflow-hidden transition-all ${
                              selectedTplId ? "border-primary/30" : "border-[var(--border-color)]"
                            }`}>
                              {/* Channel header */}
                              <div className={`flex items-center gap-2 px-4 py-2.5 ${chInfo.bg}`}>
                                <Icon className={`w-4 h-4 ${chInfo.color}`} />
                                <span className={`text-xs font-black uppercase tracking-wide ${chInfo.color}`}>{chInfo.label}</span>
                                {selectedTpl && (
                                  <span className="ml-auto text-xs text-muted-foreground truncate max-w-[150px]">
                                    {selectedTpl.name}
                                  </span>
                                )}
                              </div>

                              {/* Template selector */}
                              <div className="p-3 bg-background space-y-2">
                                <select
                                  value={selectedTplId}
                                  onChange={e => setChannelTemplates(prev => ({ ...prev, [chKey]: e.target.value }))}
                                  className="w-full bg-surface border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm outline-none focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20 font-medium"
                                >
                                  <option value="">-- Kendi Mesajımı Yazacağım --</option>
                                  {relevantTemplates.length > 0 && (
                                    <optgroup label={`★ ${chInfo.label} Şablonları`}>
                                      {relevantTemplates.map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                  {otherTemplates.length > 0 && (
                                    <optgroup label="Diğer Şablonlar">
                                      {otherTemplates.map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>

                                {/* If EMAIL and template has subject, show it as read-only */}
                                {chKey === "EMAIL" && selectedTpl?.subject && (
                                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                                    <Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">Konu Başlığı</div>
                                      <div className="text-xs font-bold truncate">{selectedTpl.subject}</div>
                                    </div>
                                  </div>
                                )}

                                {/* If EMAIL and NO template, show subject input */}
                                {chKey === "EMAIL" && !selectedTplId && (
                                  <input
                                    type="text"
                                    value={channelSubjects[chKey] || ""}
                                    onChange={e => setChannelSubjects(prev => ({ ...prev, [chKey]: e.target.value }))}
                                    placeholder="E-posta konu başlığı *"
                                    className="w-full bg-surface border border-amber-500/30 px-3 py-2.5 rounded-xl text-sm outline-none focus:border-amber-500 transition-colors focus:ring-2 focus:ring-amber-500/20"
                                  />
                                )}

                                {/* If no template selected, show custom message textarea */}
                                {!selectedTplId && (
                                  <textarea
                                    value={customMsg}
                                    onChange={e => setChannelMessages(prev => ({ ...prev, [chKey]: e.target.value }))}
                                    placeholder={`${chInfo.label} mesajınızı... Sayın {MusteriAdi}...`}
                                    rows={3}
                                    className="w-full bg-surface border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm outline-none focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                                  />
                                )}

                                {/* If template selected, show content preview */}
                                {selectedTplId && selectedTpl && (
                                  <div className="text-xs text-muted-foreground bg-surface border border-[var(--border-color)] rounded-xl px-3 py-2 line-clamp-2">
                                    {selectedTpl.content}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-xs font-medium text-muted-foreground">Değişkenler:</span>
                          {["{MusteriAdi}", "{Telefon}", "{Email}"].map(v => (
                            <span key={v} className="text-xs bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded font-mono text-muted-foreground">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSendMessage}
                      disabled={selectedCustomers.length === 0 || selectedChannels.length === 0}
                      className="w-full py-4 bg-primary text-primary-foreground font-black rounded-3xl hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-primary/30 flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      Mesajı Gönder
                      <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs ml-2">
                        {selectedCustomers.length} Kişi · {selectedChannels.length} Kanal
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TEMPLATES TAB */}
            {activeTab === "templates" && (
              <div className="max-w-5xl mx-auto h-full flex flex-col">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                      <BookOpen className="w-7 h-7 text-primary" />
                      Mesaj Şablonları
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">Sık kullanılan mesaj metinlerini kaydederek kampanya ve bilgilendirmelerinizi hızlandırın.</p>
                  </div>
                  {templates.length === 0 && (
                    <button
                      onClick={loadSeedTemplates}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm font-bold hover:bg-emerald-500/20 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" /> 5 Örnek Şablon Yükle
                    </button>
                  )}
                </div>

                <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 items-start">
                  {/* New Template Form */}
                  <div className="bg-background border border-[var(--border-color)] p-6 rounded-3xl shadow-sm sticky top-0">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Yeni Şablon Ekle</h3>
                    <form onSubmit={createTemplate} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Şablon Adı</label>
                        <input name="name" required className="w-full bg-surface border border-[var(--border-color)] px-4 py-3 rounded-2xl text-sm focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Örn: Sipariş Hazır SMS" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Mesaj Tipi</label>
                        <select
                          name="type"
                          value={templateType}
                          onChange={e => setTemplateType(e.target.value)}
                          className="w-full bg-surface border border-[var(--border-color)] px-4 py-3 rounded-2xl text-sm focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="SMS">SMS</option>
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="EMAIL">E-posta</option>
                        </select>
                      </div>

                      {/* Email Subject — only visible for EMAIL type */}
                      {templateType === "EMAIL" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-sm font-bold flex items-center gap-2">
                            <Mail className="w-4 h-4 text-amber-500" /> E-posta Konu Başlığı <span className="text-red-400">*</span>
                          </label>
                          <input
                            name="subject"
                            required
                            placeholder="Örn: Siparişiniz Hazır - Penoptik"
                            className="w-full bg-surface border border-amber-500/30 px-4 py-3 rounded-2xl text-sm focus:border-amber-500 transition-colors focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Info className="w-3 h-3" /> E-posta şablonlarında konu başlığı zorunludur. Müşteri gelen kutusunda ilk bunu görür.
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-bold flex justify-between">
                          {templateType === "EMAIL" ? "E-posta Gövdesi" : "Mesaj İçeriği"}
                          <span className="text-xs text-muted-foreground font-normal">
                            {templateType === "SMS" ? "Max. 160 karakter (standart SMS)" : "Karakter sınırı yok"}
                          </span>
                        </label>
                        <textarea name="content" required rows={5} className="w-full bg-surface border border-[var(--border-color)] px-4 py-4 rounded-2xl text-sm resize-none focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20 outline-none" placeholder={templateType === "EMAIL" ? "Sayın {MusteriAdi},\n\nMesajınız buraya..." : "Sayın {MusteriAdi}, siparişiniz hazırdır..."}></textarea>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground font-medium">Değişkenler:</span>
                          {["{MusteriAdi}", "{Telefon}", "{Email}"].map(v => (
                            <span key={v} className="text-xs bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md font-mono text-muted-foreground">{v}</span>
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                        Şablonu Kaydet
                      </button>
                    </form>
                  </div>

                  {/* Existing Templates Grid */}
                  <div className="space-y-4">
                    {templates.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-3xl text-muted-foreground p-8 text-center">
                        <BookOpen className="w-8 h-8 mb-3 opacity-20" />
                        <p className="font-medium">Henüz kayıtlı şablon bulunmuyor.</p>
                        <p className="text-sm">Formu kullanarak oluşturun veya örnek şablonları yükleyin.</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {templates.map((t: any) => {
                          const info = CHANNEL_INFO[t.type as keyof typeof CHANNEL_INFO];
                          const Icon = info?.icon || MessageSquare;
                          // For email templates, show subject as first line of the preview
                          const previewText = t.type === "EMAIL" && t.subject
                            ? `Konu: ${t.subject}\n\n${t.content}`
                            : t.content;
                          return (
                            <div
                              key={t.id}
                              className="p-5 border border-[var(--border-color)] rounded-3xl bg-background hover:shadow-md hover:border-primary/30 transition-all group flex flex-col h-full cursor-pointer"
                              onClick={() => setEditingTemplate({ ...t })}
                            >
                              {/* Card Header — identical for all types */}
                              <div className="flex items-start justify-between mb-3 gap-2">
                                <div className="font-bold text-[15px] truncate">{t.name}</div>
                                <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${info?.bg || "bg-black/5"} ${info?.color || "text-muted-foreground"}`}>
                                  <Icon className="w-3 h-3" /> {t.type}
                                </span>
                              </div>

                              {/* Content Preview — email subject shown as first line */}
                              <div className="text-sm text-muted-foreground flex-1 mb-4 leading-relaxed whitespace-pre-line line-clamp-4 bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl px-3 py-2.5 border border-[var(--border-color)]">
                                {t.type === "EMAIL" && t.subject && (
                                  <span className="font-bold text-foreground block mb-1 not-italic truncate">
                                    {t.subject}
                                  </span>
                                )}
                                <span className="line-clamp-3">{t.content}</span>
                              </div>

                              {/* Card Footer */}
                              <div className="mt-auto flex justify-between items-center">
                                <span className="text-xs text-primary font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Pencil className="w-3 h-3" /> Düzenle
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }}
                                  className="flex items-center gap-1.5 text-xs text-red-400 font-bold hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-3.5 h-3.5" /> Sil
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Edit Template Modal */}
                  {editingTemplate && (
                    <div
                      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
                      onClick={() => setEditingTemplate(null)}
                    >
                      {/* Backdrop */}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                      {/* Panel */}
                      <div
                        className="relative z-10 w-full max-w-lg bg-background border border-[var(--border-color)] rounded-3xl shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-black text-lg flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-primary" /> Şablonu Düzenle
                          </h3>
                          <button
                            onClick={() => setEditingTemplate(null)}
                            className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={updateTemplate} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold">Şablon Adı</label>
                            <input
                              name="name"
                              required
                              defaultValue={editingTemplate.name}
                              className="w-full bg-surface border border-[var(--border-color)] px-4 py-3 rounded-2xl text-sm focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold">Mesaj Tipi</label>
                            <select
                              name="type"
                              defaultValue={editingTemplate.type}
                              onChange={e => setEditingTemplate((prev: any) => ({ ...prev, type: e.target.value }))}
                              className="w-full bg-surface border border-[var(--border-color)] px-4 py-3 rounded-2xl text-sm focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                              <option value="SMS">SMS</option>
                              <option value="WHATSAPP">WhatsApp</option>
                              <option value="EMAIL">E-posta</option>
                            </select>
                          </div>

                          {editingTemplate.type === "EMAIL" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                              <label className="text-sm font-bold flex items-center gap-2">
                                <Mail className="w-4 h-4 text-amber-500" /> E-posta Konu Başlığı <span className="text-red-400">*</span>
                              </label>
                              <input
                                name="subject"
                                required
                                defaultValue={editingTemplate.subject || ""}
                                placeholder="Örn: Siparişiniz Hazır - Penoptik"
                                className="w-full bg-surface border border-amber-500/30 px-4 py-3 rounded-2xl text-sm focus:border-amber-500 transition-colors focus:ring-2 focus:ring-amber-500/20 outline-none"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-sm font-bold flex justify-between">
                              <span>İçerik</span>
                              <span className="text-xs text-muted-foreground font-normal flex gap-2">
                                {["{MusteriAdi}", "{Telefon}", "{Email}"].map(v => (
                                  <span key={v} className="bg-black/5 dark:bg-white/10 px-1.5 rounded font-mono text-[10px]">{v}</span>
                                ))}
                              </span>
                            </label>
                            <textarea
                              name="content"
                              required
                              rows={6}
                              defaultValue={editingTemplate.content}
                              className="w-full bg-surface border border-[var(--border-color)] px-4 py-4 rounded-2xl text-sm resize-none focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingTemplate(null)}
                              className="flex-1 py-3 border border-[var(--border-color)] font-bold rounded-2xl text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              İptal
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-3 bg-primary text-primary-foreground font-black rounded-2xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                            >
                              <Save className="w-4 h-4" /> Kaydet
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AUTOMATIONS TAB */}
            {activeTab === "automations" && (
              <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                    <Sparkles className="w-7 h-7 text-primary" />
                    Akıllı Otomasyonlar
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">Sipariş durumu değiştiğinde otomatik mesaj gönderilsin. <strong>Hiçbir ek işlem gerektirmez.</strong></p>
                </div>

                <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">

                  {/* ========== LEFT: Visual Rule Builder ========== */}
                  <div className="space-y-5">

                    {/* Step 1: Trigger */}
                    <div className="bg-background border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-[var(--border-color)] bg-surface/60 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">1</div>
                        <span className="font-black text-sm">Tetikleyici Olay Seç</span>
                        <span className="text-xs text-muted-foreground ml-auto">Ne zaman çalışsın?</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {[
                          { value: "ORDER_CREATED",   emoji: "🆕", label: "Yeni Sipariş Oluşturulduğunda",   desc: "Müşteri sipariş verdiği an tetiklenir" },
                          { value: "ORDER_READY",     emoji: "📦", label: "Sipariş Hazır Olduğunda",         desc: "Sipariş READY statüsüne geçince" },
                          { value: "ORDER_DELIVERED", emoji: "✅", label: "Sipariş Teslim Edildiğinde",       desc: "Sipariş DELIVERED statüsüne geçince" },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setAutoTrigger(opt.value)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                              autoTrigger === opt.value
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-transparent hover:border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                          >
                            <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className={`font-bold text-sm ${autoTrigger === opt.value ? "text-primary" : "text-foreground"}`}>{opt.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                              autoTrigger === opt.value ? "border-primary bg-primary" : "border-[var(--border-color)]"
                            }`}>
                              {autoTrigger === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Template */}
                    <div className="bg-background border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-[var(--border-color)] bg-surface/60 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">2</div>
                        <span className="font-black text-sm">Gönderilecek Şablonu Seç</span>
                        <span className="text-xs text-muted-foreground ml-auto">Ne gönderilsin?</span>
                      </div>
                      <div className="p-4">
                        {templates.length === 0 ? (
                          <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-sm text-red-600 dark:text-red-400">Şablon Bulunamadı</div>
                              <div className="text-xs text-muted-foreground mt-1">Önce <button onClick={() => setActiveTab("templates")} className="text-primary font-bold hover:underline">Hazır Şablonlar</button> sekmesinden bir şablon oluşturun.</div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {templates.map((t: any) => {
                              const info = CHANNEL_INFO[t.type as keyof typeof CHANNEL_INFO];
                              const Icon = info?.icon || MessageSquare;
                              const isSelected = autoTemplateId === t.id;
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => setAutoTemplateId(t.id)}
                                  className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary/5 shadow-sm"
                                      : "border-transparent hover:border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5"
                                  }`}
                                >
                                  <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${info?.bg || "bg-black/5"}`}>
                                    <Icon className={`w-4 h-4 ${info?.color || "text-muted-foreground"}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{t.name}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{t.subject || t.content.slice(0, 60)}{!t.subject && t.content.length > 60 ? "..." : ""}</div>
                                  </div>
                                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-colors ${
                                    isSelected ? "border-primary bg-primary" : "border-[var(--border-color)]"
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Settings */}
                    <div className="bg-background border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-[var(--border-color)] bg-surface/60 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">3</div>
                        <span className="font-black text-sm">Kural Adı & Zamanlama</span>
                        <span className="text-xs text-muted-foreground ml-auto">Opsiyonel</span>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Kural Adı (Opsiyonel)</label>
                          <input
                            value={autoName}
                            onChange={e => setAutoName(e.target.value)}
                            placeholder="Örn: Sipariş Hazır SMS Bildirimi"
                            className="w-full bg-surface border border-[var(--border-color)] px-4 py-3 rounded-2xl text-sm focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                          <p className="text-xs text-muted-foreground mt-1.5">Boş bırakırsanız tetikleyiciden otomatik isim atanır.</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Gönderim Zamanlaması</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: "0",    label: "Anında",      sub: "Olay gerçekleşince" },
                              { value: "5",    label: "5 dk sonra",  sub: "Kısa gecikme" },
                              { value: "30",   label: "30 dk sonra", sub: "Belirli gecikme" },
                              { value: "1440", label: "1 gün sonra", sub: "Ertesi gün" },
                            ].map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setAutoDelay(opt.value)}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                                  autoDelay === opt.value
                                    ? "border-primary bg-primary/5"
                                    : "border-[var(--border-color)] hover:border-primary/40"
                                }`}
                              >
                                <div className={`font-bold text-sm ${ autoDelay === opt.value ? "text-primary" : ""}`}>{opt.label}</div>
                                <div className="text-xs text-muted-foreground">{opt.sub}</div>
                              </button>
                            ))}
                          </div>
                          {autoDelay !== "0" && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-2 bg-amber-500/10 px-3 py-2 rounded-lg">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                              Zamanlı gönderim şu an simülasyon modundadır. Gerçek gecikme için bir iş kuyruğu (job queue) entegrasyonu gereklidir.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Summary + Save */}
                    {autoTrigger && autoTemplateId && (() => {
                      const tpl = templates.find((t: any) => t.id === autoTemplateId);
                      const tInfo = CHANNEL_INFO[tpl?.type as keyof typeof CHANNEL_INFO];
                      const TIcon = tInfo?.icon || MessageSquare;
                      return (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-5">
                          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Kural Özeti
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-xl">{["ORDER_CREATED", "ORDER_READY", "ORDER_DELIVERED"].includes(autoTrigger) ? ["🆕", "📦", "✅"][["ORDER_CREATED", "ORDER_READY", "ORDER_DELIVERED"].indexOf(autoTrigger)] : "⚡"}</span>
                            <span className="font-medium text-muted-foreground">{TRIGGER_LABELS[autoTrigger]?.replace(/^[^ ]+ /, "")}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${tInfo?.bg || "bg-black/5"} ${tInfo?.color || ""}`}>
                              <TIcon className="w-3.5 h-3.5" />
                              <span className="font-bold text-xs">{tpl?.name}</span>
                            </div>
                            {autoDelay !== "0" && <span className="text-xs text-muted-foreground">• {autoDelay === "5" ? "5 dk sonra" : autoDelay === "30" ? "30 dk sonra" : "1 gün sonra"}</span>}
                          </div>
                          <form onSubmit={createAutomation}>
                            <button
                              type="submit"
                              className="w-full mt-4 py-3.5 bg-primary text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                            >
                              <Sparkles className="w-4 h-4" /> Otomasyonu Oluştur
                            </button>
                          </form>
                        </div>
                      );
                    })()}

                    {(!autoTrigger || !autoTemplateId) && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        Tetikleyici ve şablon seçildiğinde kural özeti burada görünecek.
                      </div>
                    )}
                  </div>

                  {/* ========== RIGHT: Existing Automations + How It Works ========== */}
                  <div className="space-y-6">

                    {/* How It Works */}
                    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5">
                      <h4 className="font-black text-primary flex items-center gap-2 mb-4 text-sm">
                        <Info className="w-4 h-4" /> Otomasyon Nasıl Çalışır?
                      </h4>
                      <div className="space-y-3">
                        {[
                          { step: "1", icon: Zap, title: "Olay Tetiklenir", desc: "Sipariş durumu değiştiğinde sistem otomatik devreye girer." },
                          { step: "2", icon: BookOpen, title: "Şablon Hazırlanır", desc: "{MusteriAdi} gibi değişkenler otomatik doldurulur." },
                          { step: "3", icon: Send, title: "Mesaj Gönderilir", desc: "SMS / WhatsApp / E-posta sağlayıcısı üzerinden iletilir." },
                        ].map(item => {
                          const Icon = item.icon;
                          return (
                            <div key={item.step} className="flex gap-3">
                              <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex-shrink-0 flex items-center justify-center font-black text-xs">{item.step}</div>
                              <div>
                                <div className="font-bold text-sm">{item.title}</div>
                                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-primary/10">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          Gerçek gönderim için Netgsm/Twilio/WhatsApp Business API entegrasyonu gereklidir.
                        </p>
                      </div>
                    </div>

                    {/* Automation Rules List */}
                    <div>
                      <h4 className="font-black text-sm mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        Aktif Kurallar
                        <span className="ml-auto text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">{automations.length} kural</span>
                      </h4>
                      {automations.length === 0 ? (
                        <div className="h-36 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-3xl text-muted-foreground p-6 text-center">
                          <Sparkles className="w-7 h-7 mb-2 opacity-20" />
                          <p className="font-medium text-sm">Henüz otomasyon kuralı yok.</p>
                          <p className="text-xs mt-1">Sol taraftaki adımları takip ederek ilk kuralı oluşturun.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {automations.map((a: any) => {
                            const tpl = a.template;
                            const info = tpl ? CHANNEL_INFO[tpl.type as keyof typeof CHANNEL_INFO] : null;
                            const Icon = info?.icon || MessageSquare;
                            const triggerEmoji = { ORDER_CREATED: "🆕", ORDER_READY: "📦", ORDER_DELIVERED: "✅" }[a.trigger as string] || "⚡";
                            return (
                              <div key={a.id} className={`border rounded-3xl transition-all overflow-hidden ${
                                a.isActive ? "border-primary/20 bg-primary/5" : "border-[var(--border-color)] bg-background opacity-70"
                              }`}>
                                <div className="p-4 flex items-center gap-3">
                                  <span className="text-xl flex-shrink-0">{triggerEmoji}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-black text-sm text-foreground truncate">{a.name}</div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span className="text-xs text-muted-foreground">{TRIGGER_LABELS[a.trigger]?.replace(/^[^ ]+ /, "") || a.trigger}</span>
                                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                      {tpl && (
                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${info?.bg || "bg-black/5"} ${info?.color || ""}`}>
                                          <Icon className="w-3 h-3" /> {tpl.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => toggleAutomation(a.id, a.isActive)}
                                      className="group"
                                      title={a.isActive ? "Durdur" : "Etkinleştir"}
                                    >
                                      {a.isActive
                                        ? <ToggleRight className="w-8 h-8 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                                        : <ToggleLeft className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />}
                                    </button>
                                    <button
                                      onClick={() => deleteAutomation(a.id)}
                                      className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                      title="Sil"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="px-4 pb-3 flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                                    a.isActive
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : "bg-black/5 dark:bg-white/10 text-muted-foreground"
                                  }`}>
                                    {a.isActive ? <><CheckCircle2 className="w-3 h-3" /> Aktif</> : <>Pasif</>}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LOGS TAB */}
            {activeTab === "logs" && (
              <div className="max-w-6xl mx-auto h-full flex flex-col">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                    <Clock className="w-7 h-7 text-primary" />
                    İletişim Geçmişi
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">Sistem üzerinden başarıyla iletilen veya hata veren tüm mesaj kayıtlarını detaylı inceleyin.</p>
                </div>

                <div className="border border-[var(--border-color)] rounded-3xl overflow-hidden bg-background shadow-sm flex-1">
                  <div className="overflow-x-auto h-full">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-surface/50 border-b border-[var(--border-color)] text-muted-foreground font-bold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Tarih</th>
                          <th className="px-6 py-4">Kanal</th>
                          <th className="px-6 py-4">Alıcı</th>
                          <th className="px-6 py-4 w-full">İçerik Özeti</th>
                          <th className="px-6 py-4 text-right">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {logs.length === 0 ? (
                          <tr><td colSpan={5} className="p-12 text-center text-muted-foreground font-medium">Henüz bir mesaj kaydı bulunamadı.</td></tr>
                        ) : logs.map((l: any) => (
                          <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-muted-foreground">{new Date(l.createdAt).toLocaleString("tr-TR")}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 font-bold text-xs">
                                {l.type === "SMS" && <MessageSquare className="w-4 h-4 text-sky-500" />}
                                {l.type === "WHATSAPP" && <Smartphone className="w-4 h-4 text-emerald-500" />}
                                {l.type === "EMAIL" && <Mail className="w-4 h-4 text-amber-500" />}
                                {l.type}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-black">{l.to}</td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-muted-foreground max-w-md truncate bg-surface px-3 py-1.5 rounded-lg border border-[var(--border-color)]" title={l.content}>
                                {l.content}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {l.status === "SENT" ? (
                                <span className="inline-flex text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Başarılı
                                </span>
                              ) : l.status === "FAILED" ? (
                                <span className="inline-flex text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Hata
                                </span>
                              ) : (
                                <span className="inline-flex text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                                  {l.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* INTEGRATIONS TAB */}
            {activeTab === "integrations" && (
              <div className="h-full flex flex-col max-w-5xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                    <Link2 className="w-7 h-7 text-primary" />
                    API Bağlantıları
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">Mesaj gönderimi yapmak için servis sağlayıcılarınızı sisteme bağlayın.</p>
                </div>
                
                <div className="bg-background border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm p-6 lg:p-8 flex-1">
                  <div className="max-w-2xl mx-auto text-center space-y-6 mt-12">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <Settings className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold">Entegrasyon Yönetimi</h3>
                    <p className="text-muted-foreground">
                      SMS, WhatsApp ve E-posta gibi servis sağlayıcılarınızın API anahtarlarını, sistemin ana Entegrasyonlar panelinden yönetebilirsiniz.
                    </p>
                    <div className="pt-4">
                      <Link href="/admin/integrations" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                        Entegrasyon Paneline Git <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
