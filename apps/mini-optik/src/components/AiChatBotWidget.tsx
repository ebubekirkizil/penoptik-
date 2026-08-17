"use client";

import { createPortal } from 'react-dom';
import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Camera,
  Loader2,
  Sparkles,
  UserCheck,
  UserPlus,
  ChevronRight,
  Maximize2,
  Minimize2,
  Edit3,
  CheckCircle,
  FolderPlus,
  Trash2,
  Mic,
  Square,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  attachedImageUrl?: string;
  mode?: "text" | "vision";
  ocrData?: {
    customer?: { id: string; firstName: string; lastName: string; phone: string };
    prescription?: { id: string };
    createdNewCustomer?: boolean;
    parsedRx?: any;
    isBatch?: boolean;
    batchResults?: any[];
  };
}

const OPTICAL_FIELDS = [
  { key: "farRightSph", label: "Uzak Sağ SPH" },
  { key: "farRightCyl", label: "Uzak Sağ CYL" },
  { key: "farRightAx", label: "Uzak Sağ AX" },
  { key: "farLeftSph", label: "Uzak Sol SPH" },
  { key: "farLeftCyl", label: "Uzak Sol CYL" },
  { key: "farLeftAx", label: "Uzak Sol AX" },
  { key: "nearRightSph", label: "Yakın Sağ SPH" },
  { key: "nearRightCyl", label: "Yakın Sağ CYL" },
  { key: "nearRightAx", label: "Yakın Sağ AX" },
  { key: "nearLeftSph", label: "Yakın Sol SPH" },
  { key: "nearLeftCyl", label: "Yakın Sol CYL" },
  { key: "nearLeftAx", label: "Yakın Sol AX" },
  { key: "constantRightSph", label: "Daimi Sağ SPH" },
  { key: "constantRightCyl", label: "Daimi Sağ CYL" },
  { key: "constantRightAx", label: "Daimi Sağ AX" },
  { key: "constantLeftSph", label: "Daimi Sol SPH" },
  { key: "constantLeftCyl", label: "Daimi Sol CYL" },
  { key: "constantLeftAx", label: "Daimi Sol AX" },
  { key: "addRight", label: "Sağ ADD" },
  { key: "addLeft", label: "Sol ADD" },
  { key: "pdRight", label: "Sağ PD" },
  { key: "pdLeft", label: "Sol PD" },
  { key: "pdTotal", label: "Top PD" },
  { key: "phRight", label: "Sağ PH" },
  { key: "phLeft", label: "Sol PH" },
  { key: "lensType", label: "Cam Tipi" },
  { key: "coating", label: "Kaplama" },
  { key: "doctorName", label: "Doktor" },
  { key: "hospitalName", label: "Hastane" },
];

export default function AiChatBotWidget() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [pendingDecisionImage, setPendingDecisionImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [isAiActive, setIsAiActive] = useState<boolean | null>(null);

  // Batch Editing Modal State
  const [batchModalItems, setBatchModalItems] = useState<any[] | null>(null);

  // Interactive Order & Customer Management Portal State
  const [orderPortalDraft, setOrderPortalDraft] = useState<{
    intentType?: "PRESCRIPTION" | "ORDER" | "BOTH" | "NONE";
    customerId?: string;
    firstName: string;
    lastName: string;
    phone: string;
    tcNo?: string;
    email?: string;
    address?: string;
    productName: string;
    productCode: string;
    totalPrice: string;
    downPayment: string;
    installmentCount: string;
    deliveryStatus: string;
    availableStatuses?: string[];
    saleDate?: string;
    deliveryDate?: string;
    notes: string;
    installments?: Array<{ number: number; date: string; amount: number }>;
    [key: string]: any;
  } | null>(null);

  const [financePortalDraft, setFinancePortalDraft] = useState<{
    type: "INCOME" | "EXPENSE";
    amount: number;
    category: string;
    description: string;
  } | null>(null);

  const [inventoryPortalDraft, setInventoryPortalDraft] = useState<{
    type: "ADD" | "UPDATE";
    productName: string;
    productCode?: string;
    quantity: number;
    price?: number;
  } | null>(null);

  // Customer Search State
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  useEffect(() => {
    if (customerSearchQuery.length < 3) {
      setCustomerSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setCustomerSearchResults(data.customers || []);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearchQuery]);

  // Voice Recording to Live Text (Web Speech API with 5-Minute Timer)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const isRecordingIntent = useRef(false);
  const finalTranscriptRef = useRef("");

  const stopSpeechRecognition = () => {
    isRecordingIntent.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecordingVoice(false);
  };

  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      stopSpeechRecognition();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Tarayıcınız canlı sesli yazmayı desteklemiyor. Lütfen Chrome veya Edge kullanın.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "tr-TR";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + " ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInputMessage(finalTranscriptRef.current + interim);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          console.error("Speech Recognition Error:", event.error);
          // If it's a real error (e.g. not-allowed), stop trying to restart
          isRecordingIntent.current = false;
        }
      };

      recognition.onend = () => {
        if (isRecordingIntent.current && recognitionRef.current) {
          setTimeout(() => {
            if (isRecordingIntent.current && recognitionRef.current) {
              try { recognitionRef.current.start(); } catch(e) {}
            }
          }, 250);
        } else {
          setIsRecordingVoice(false);
        }
      };

      isRecordingIntent.current = true;
      finalTranscriptRef.current = inputMessage ? inputMessage + " " : "";
      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      toast.error("Mikrofon başlatılamadı.");
      stopSpeechRecognition();
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Merhaba! Ben **Pen AI Asistanı**. Sisteme yeni reçete eklemekten, siparişlerinizi ve finansal verilerinizi sorgulamaya kadar her konuda size yardımcı olabilirim. Hemen aşağıdan reçete yükleyebilir veya bana istediğiniz her şeyi sorabilirsiniz!",
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const hasUserInteraction = messages.some((m) => m.sender === "user");
  const visibleMessages = messages.filter((m) => {
    if (m.id === "welcome") return !hasUserInteraction;
    return true;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isAiBotActive === "boolean") {
          setIsAiActive(data.isAiBotActive);
        } else {
          setIsAiActive(true);
        }
      })
      .catch(() => setIsAiActive(true));
  }, []);

  if (isAiActive === false) {
    return null;
  }

  // Text Message Handler
  const handleSendMessage = async (textToSend?: string, customImage?: File) => {
    const query = textToSend || inputMessage.trim();
    const imageToSend = customImage || attachedImage;
    if (!query || loading) return;

    // Mikrofonu ve canlı yazmayı derhal kapat, geç kalan event'leri engelle ve yazıyı temizle
    stopSpeechRecognition();
    if (!textToSend) setInputMessage("");

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      attachedImageUrl: imageToSend ? URL.createObjectURL(imageToSend) : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      let res;
      if (imageToSend) {
        const formData = new FormData();
        formData.append("message", query);
        formData.append("history", JSON.stringify(messages));
        formData.append("file", imageToSend);
        
        res = await fetch("/api/ai/chat", {
          method: "POST",
          body: formData,
        });
        if (!customImage) setAttachedImage(null);
      } else {
        res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: query, history: messages }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yapay zeka yanıt veremedi.");

      if (data.pendingCustomerData) {
        sessionStorage.setItem("pendingAiCustomer", JSON.stringify(data.pendingCustomerData));
        setOrderPortalDraft(data.pendingCustomerData);
      }
      
      if (data.pendingFinanceData && data.pendingFinanceData.amount > 0) {
        setFinancePortalDraft(data.pendingFinanceData);
      }

      if (data.pendingInventoryData && data.pendingInventoryData.quantity > 0) {
        setInventoryPortalDraft(data.pendingInventoryData);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        mode: "text",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Multi-File Image Upload Handler (Camera & Gallery)
  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // YENİ AKIŞ: Tek fotoğraf yüklendiyse, doğrudan sohbete dosya eki (attachedImage) olarak ekle.
    if (selectedFiles.length === 1) {
      setPendingDecisionImage(selectedFiles[0]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    const filesToProcess = selectedFiles.slice(0, 10);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: `🖼️ **${filesToProcess.length} Adet Reçete Görseli Yüklendi:**\n${filesToProcess.map((f) => `• ${f.name}`).join("\n")}`,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const formData = new FormData();
    filesToProcess.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/ai/chat", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Görseller okunamadı.");
      
      if (data.isBatch && Array.isArray(data.batchResults)) {
        // Multi-image batch preview drawer setup
        const editItems = data.batchResults.map((resItem: any, idx: number) => ({
          tempId: `item_${idx}`,
          fileName: resItem.fileName,
          firstName: resItem.parsedRx?.firstName || "",
          lastName: resItem.parsedRx?.lastName || "",
          phone: resItem.parsedRx?.phone || "",
          lensType: resItem.parsedRx?.lensType || "",
          doctorName: resItem.parsedRx?.doctorName || "",
          hospitalName: resItem.parsedRx?.hospitalName || "",
          farRightSph: resItem.parsedRx?.farRightSph || "",
          farRightCyl: resItem.parsedRx?.farRightCyl || "",
          farRightAx: resItem.parsedRx?.farRightAx || "",
          farLeftSph: resItem.parsedRx?.farLeftSph || "",
          farLeftCyl: resItem.parsedRx?.farLeftCyl || "",
          farLeftAx: resItem.parsedRx?.farLeftAx || "",
          pdTotal: resItem.parsedRx?.pdTotal || "",
          notes: resItem.parsedRx?.notes || "",
          prescriptionNotes: resItem.parsedRx?.prescriptionNotes || "",
        }));

        setBatchModalItems(editItems);

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `🔍 **${filesToProcess.length} Adet Reçete Analiz Edildi!**\nVeriler düzenleme modunda açıldı. Lütfen alanları kontrol edip **'Tümünü Onayla ve Kaydet'** butonuna basın.`,
          timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          mode: "vision",
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Single file direct result
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          mode: "vision",
          ocrData: {
            customer: data.customer,
            prescription: data.prescription,
            createdNewCustomer: data.createdNewCustomer,
            parsedRx: data.parsedRx,
          },
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      toast.error(err.message || "Görsel okuma hatası oluştu.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  // Submit Batch Confirmation to DB
  const handleConfirmSaveBatch = async () => {
    if (!batchModalItems || batchModalItems.length === 0) return;

    setSavingBatch(true);
    try {
      const res = await fetch("/api/ai/save-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: batchModalItems }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reçeteler kaydedilemedi.");

      toast.success(`${data.count} adet reçete onaylanarak sisteme kaydedildi!`);

        const summaryText = data.savedResults
          .map(
            (r: any, i: number) =>
              `• **${r.customer?.firstName || 'Bilinmeyen'} ${r.customer?.lastName || 'Müşteri'}** (${r.customer?.phone || '-'}) ${
                r.createdNewCustomer ? "➡️ *[Yeni Kayıt]*" : "➡️ *[Mevcut Müşteri]*"
              }`
          )
          .join("\n");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: `✅ **Toplu Reçete Kaydı Başarıyla Tamamlandı! (${data.count} Adet)**\n\n${summaryText}`,
          timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      setBatchModalItems(null);
    } catch (err: any) {
      toast.error(err.message || "Kaydetme sırasında hata oluştu.");
    } finally {
      setSavingBatch(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImagesUpload}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImagesUpload}
      />

      {/* Floating Action Button */}
      {!isOpen && (
        <motion.div
          drag
          dragMomentum={false}
          className="fixed bottom-24 sm:bottom-6 right-6 z-[9999] cursor-grab active:cursor-grabbing"
          title="Pen AI'ı Aç"
        >
          <ShimmerButton
            onClick={() => setIsOpen(true)}
            background="linear-gradient(to right, #5c9ca8, #2d6874)"
            className="shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 px-5 py-2.5"
            shimmerSize="0.12em"
            shimmerDuration="2s"
            shimmerColor="#ffffff"
          >
            <div className="flex items-center gap-2 pointer-events-none text-white">
              <Sparkles className="w-4 h-4 text-amber-200/90" />
              <span className="font-bold text-sm">Pen AI</span>
            </div>
          </ShimmerButton>
        </motion.div>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-[9999] transition-all duration-300 flex flex-col bg-background dark:bg-[#1E293B] border border-border-color shadow-2xl rounded-3xl overflow-hidden ${
            isExpanded
              ? "inset-4 sm:inset-10 max-w-5xl mx-auto my-auto h-[90vh]"
              : "bottom-4 right-4 w-[92vw] sm:w-[440px] h-[600px] max-h-[92vh]"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#5c9ca8] to-[#2d6874] text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5 leading-tight">
                  Pen AI Asistanı
                  <span className="bg-emerald-400/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/40">
                    Aktif
                  </span>
                </h3>
                <p className="text-[11px] text-white/80">Çoklu Galeri & Kamera OCR Destekli</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                title={isExpanded ? "Küçült" : "Genişlet"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-surface/30">
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-sm shadow-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#5c9ca8] to-[#3a7c88] text-white rounded-br-none"
                      : "bg-surface border border-border-color text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.attachedImageUrl && (
                    <div className="mb-2">
                      <img src={msg.attachedImageUrl} alt="Attached" className="max-w-full h-32 object-cover rounded-xl border border-white/20 shadow-sm" />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">
                    {msg.text.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
                      const match = /\[(.*?)\]\((.*?)\)/.exec(part);
                      if (match) {
                        return (
                          <Link
                            key={i}
                            href={match[2]}
                            onClick={() => setIsOpen(false)}
                            className="inline-block mt-2 px-3 py-1.5 bg-[#5c9ca8]/20 text-[#5c9ca8] font-bold rounded-lg border border-[#5c9ca8]/30 hover:bg-[#5c9ca8]/30 transition-colors"
                          >
                            {match[1]}
                          </Link>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>

                  {msg.ocrData && (
                    <div className="mt-3 p-3 bg-background/80 rounded-xl border border-border-color space-y-2 text-xs text-foreground">
                      <div className="flex items-center justify-between pb-2 border-b border-border-color">
                        <span className="font-bold flex items-center gap-1 text-[#5c9ca8]">
                          {msg.ocrData.createdNewCustomer ? (
                            <>
                              <UserPlus className="w-4 h-4 text-emerald-500" /> Otomatik Müşteri Açıldı
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 text-blue-500" /> Mevcut Müşteriye Eklendi
                            </>
                          )}
                        </span>
                      </div>

                      {msg.ocrData.customer && (
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <p className="font-bold">
                              {msg.ocrData.customer?.firstName || 'Bilinmeyen'} {msg.ocrData.customer?.lastName || 'Müşteri'}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{msg.ocrData.customer?.phone || '-'}</p>
                          </div>
                          <Link
                            href={`/admin/customers/${msg.ocrData.customer.id}`}
                            onClick={() => setIsOpen(false)}
                            className="px-2.5 py-1 bg-[#5c9ca8]/10 text-[#5c9ca8] font-bold rounded-lg hover:bg-[#5c9ca8]/20 flex items-center gap-1 transition-colors"
                          >
                            Profili Gör <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === "user" ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs p-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#5c9ca8]" />
                <span>
                  {messages[messages.length - 1]?.text?.includes("Adet Reçete Görseli") 
                    ? "Reçeteler okunuyor, lütfen bekleyin..." 
                    : "Yapay zeka düşünüyor..."}
                </span>
              </div>
            )}

            {pendingDecisionImage && (
              <div className="flex flex-col p-4 bg-background border border-border-color rounded-2xl mx-2 mb-2 shadow-lg animate-in slide-in-from-bottom-2">
                <div className="flex items-start gap-3 mb-3">
                  <img src={URL.createObjectURL(pendingDecisionImage)} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-border-color shadow-sm" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Görsel Yüklendi</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Bu görsel ile hangi işlemi yapmak istiyorsunuz?</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      handleSendMessage("Bu görseldeki reçeteyi sisteme kaydetmek istiyorum. Lütfen analiz et.", pendingDecisionImage);
                      setPendingDecisionImage(null);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5c9ca8] to-[#3a7c88] text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
                  >
                    <FolderPlus className="w-4 h-4" /> Yeni Reçete Kaydı Oluştur
                  </button>
                  <button
                    onClick={() => {
                      handleSendMessage("Bu görseli analiz et ve yorumla.", pendingDecisionImage);
                      setPendingDecisionImage(null);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border-color hover:bg-surface/80 text-foreground rounded-xl text-sm font-medium transition-colors"
                  >
                    <Sparkles className="w-4 h-4" /> Sohbet Olarak Analiz Et
                  </button>
                  <button
                    onClick={() => setPendingDecisionImage(null)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-colors mt-1"
                  >
                    <X className="w-4 h-4" /> İptal Et
                  </button>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Action Buttons */}
          <div className="px-3 py-2 bg-background border-t border-border-color flex items-center gap-2 overflow-x-auto text-xs shrink-0 no-scrollbar">
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5c9ca8]/10 text-[#5c9ca8] hover:bg-[#5c9ca8]/20 rounded-full font-bold transition-colors whitespace-nowrap shrink-0 border border-[#5c9ca8]/30"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Galeriden Seç (Çoklu)
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5c9ca8]/10 text-[#5c9ca8] hover:bg-[#5c9ca8]/20 rounded-full font-bold transition-colors whitespace-nowrap shrink-0 border border-[#5c9ca8]/30"
            >
              <Camera className="w-3.5 h-3.5" /> Kamera ile Foto Çek
            </button>
          </div>

            {attachedImage && (
              <div className="px-4 py-2 bg-background border-t border-border-color">
                <div className="relative inline-block">
                  <img
                    src={URL.createObjectURL(attachedImage)}
                    alt="Attached"
                    className="h-16 w-16 object-cover rounded-xl border border-border-color shadow-sm"
                  />
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:scale-110 transition-transform"
                    title="Görseli Kaldır"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

          {/* Input Footer */}
          <div className="p-3 bg-background border-t border-border-color flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={loading}
              className="p-2.5 text-muted-foreground hover:text-[#5c9ca8] hover:bg-surface rounded-xl transition-colors disabled:opacity-50"
              title="Galeriden Çoklu Reçete Fotoğrafı Yükle"
            >
              <FolderPlus className="w-5 h-5" />
            </button>

            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                autoFocus
                placeholder={
                  isRecordingVoice
                    ? "🎙️ Sınırsız Dinleniyor..."
                    : "Mesaj yazın veya konuşun..."
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (isRecordingVoice) toggleVoiceRecording();
                    handleSendMessage();
                  }
                }}
                disabled={loading}
                className={`w-full bg-surface border border-border-color rounded-xl pl-4 pr-16 py-2.5 text-sm focus:outline-none focus:border-[#5c9ca8] transition-colors ${
                  isRecordingVoice ? "border-red-500/60 bg-red-500/5 ring-2 ring-red-500/20" : ""
                }`}
              />

              {isRecordingVoice && (
                <span className="absolute right-9 text-xs font-bold font-mono text-red-500 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  Kayıt
                </span>
              )}

              <button
                type="button"
                onClick={toggleVoiceRecording}
                disabled={loading}
                className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                  isRecordingVoice
                    ? "bg-red-500 text-white animate-pulse shadow-md"
                    : "text-muted-foreground hover:text-[#5c9ca8] hover:bg-background"
                }`}
                title={isRecordingVoice ? "Dinlemeyi Durdur" : "Sesle Yaz (Canlı Mikrofon)"}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isRecordingVoice) toggleVoiceRecording();
                handleSendMessage();
              }}
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 bg-gradient-to-r from-[#5c9ca8] to-[#3a7c88] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
              title="Gönder"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BATCH OCR REVIEW & EDIT MODAL / DRAWER */}
      {batchModalItems && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background dark:bg-[#1E293B] border border-border-color w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#5c9ca8] to-[#2d6874] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Reçete Verilerini Kontrol Edin ve Düzenleyin</h3>
                  <p className="text-xs text-white/80">
                    Okunan {batchModalItems.length} adet reçetedeki bilgileri kaydetmeden önce düzeltebilirsiniz.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBatchModalItems(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content / Cards */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {batchModalItems.map((item, idx) => (
                <div
                  key={item.tempId}
                  className="p-5 rounded-2xl border border-border-color bg-surface/50 space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b border-border-color pb-3">
                    <span className="font-bold text-sm text-[#5c9ca8] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#5c9ca8] text-white flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      {item.fileName}
                    </span>
                    <button
                      onClick={() =>
                        setBatchModalItems((prev) => prev?.filter((_, i) => i !== idx) || null)
                      }
                      className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4" /> Kaldır
                    </button>
                  </div>

                  {/* Customer Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-muted-foreground mb-1">Müşteri Adı</label>
                      <input
                        type="text"
                        value={item.firstName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBatchModalItems((prev) =>
                            prev?.map((it, i) => (i === idx ? { ...it, firstName: val } : it)) || null
                          );
                        }}
                        className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-muted-foreground mb-1">Müşteri Soyadı</label>
                      <input
                        type="text"
                        value={item.lastName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBatchModalItems((prev) =>
                            prev?.map((it, i) => (i === idx ? { ...it, lastName: val } : it)) || null
                          );
                        }}
                        className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-muted-foreground mb-1">Telefon Numarası</label>
                      <input
                        type="text"
                        value={item.phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBatchModalItems((prev) =>
                            prev?.map((it, i) => (i === idx ? { ...it, phone: val } : it)) || null
                          );
                        }}
                        className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8]"
                      />
                    </div>
                  </div>

                  {/* Optical Measurement Fields */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                    {OPTICAL_FIELDS.filter(f => item[f.key]).map(f => (
                      <div key={f.key}>
                        <label className="block font-medium text-muted-foreground mb-1">{f.label}</label>
                        <input
                          type="text"
                          value={item[f.key] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBatchModalItems((prev) =>
                              prev?.map((it, i) => (i === idx ? { ...it, [f.key]: val } : it)) || null
                            );
                          }}
                          className="w-full bg-background border border-border-color rounded-xl px-3 py-2 focus:outline-none focus:border-[#5c9ca8]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-background border-t border-border-color flex justify-between items-center">
              <button
                onClick={() => setBatchModalItems(null)}
                className="px-4 py-2 text-sm rounded-xl border border-border-color text-muted-foreground font-bold hover:bg-surface transition-colors"
              >
                İptal Et
              </button>

              <button
                onClick={handleConfirmSaveBatch}
                disabled={savingBatch}
                className="px-4 py-2 text-sm bg-gradient-to-r from-[#5c9ca8] to-[#2d6874] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {savingBatch ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {savingBatch ? "İşleniyor..." : "Tümünü Onayla ve Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SİPARİŞ VE MÜŞTERİ YÖNETİM PORTALI / MODAL */}
      {orderPortalDraft && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background border border-border-color w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#5c9ca8] to-[#2d6874] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
                  📋
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Sipariş & Müşteri Düzenleme Portalı</h3>
                  <p className="text-xs text-white/80">
                    Sipariş detaylarını, taksit tarihlerini ve müşteri bilgilerini inceleyin, düzenleyin ve onaylayın.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOrderPortalDraft(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Editable Form Grid */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 text-left">
              {/* Customer Section */}
              <div className="p-4 rounded-2xl border border-border-color bg-surface/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5c9ca8]">Müşteri Seçimi</h4>
                  <button 
                    onClick={() => setIsSearchingCustomers(!isSearchingCustomers)}
                    className="text-[10px] bg-[#5c9ca8]/10 text-[#5c9ca8] font-bold px-3 py-1.5 rounded-lg hover:bg-[#5c9ca8]/20 transition-colors"
                  >
                    {isSearchingCustomers ? "Manuel Giriş Yap" : "Müşteri Değiştir / Ara"}
                  </button>
                </div>

                {isSearchingCustomers ? (
                  <div className="space-y-3 animate-fade-in-up">
                    <input 
                      type="text"
                      placeholder="Müşteri Adı veya Telefonu ile ara..." 
                      value={customerSearchQuery} 
                      onChange={(e) => setCustomerSearchQuery(e.target.value)} 
                      className="w-full bg-background border border-[#5c9ca8]/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8] focus:ring-1 focus:ring-[#5c9ca8]/50" 
                      autoFocus
                    />
                    {customerSearchResults.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border border-border-color rounded-xl p-1 bg-background/50">
                        {customerSearchResults.map(c => (
                          <div 
                            key={c.id} 
                            className="p-2 hover:bg-[#5c9ca8]/10 rounded-lg cursor-pointer text-xs transition-colors flex items-center justify-between group" 
                            onClick={() => {
                              setOrderPortalDraft({...orderPortalDraft, firstName: c.firstName, lastName: c.lastName, phone: c.phone, customerId: c.id});
                              setIsSearchingCustomers(false);
                            }}
                          >
                            <div>
                              <span className="font-bold text-foreground">{c.firstName} {c.lastName}</span>
                              <span className="text-muted-foreground ml-2">{c.phone}</span>
                            </div>
                            <UserCheck className="w-4 h-4 text-[#5c9ca8] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    )}
                    {customerSearchQuery.length >= 3 && customerSearchResults.length === 0 && (
                       <div className="text-xs text-muted-foreground text-center p-2">Müşteri bulunamadı.</div>
                    )}
                  </div>
                ) : (
                  <div>
                    {orderPortalDraft.customerId || orderPortalDraft.isExistingCustomer ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center justify-between">
                         <div>
                           <span className="block text-[10px] font-bold text-emerald-500 uppercase mb-0.5 tracking-wider flex items-center gap-1">
                             <UserCheck className="w-3 h-3" /> {orderPortalDraft.isExistingCustomer && !orderPortalDraft.customerId ? "Seçili Müşteri (Sistemden Bulunacak)" : "Seçili Müşteri"}
                           </span>
                           <span className="font-bold text-sm text-foreground">{orderPortalDraft.firstName} {orderPortalDraft.lastName}</span>
                           {orderPortalDraft.phone && <span className="ml-2 text-xs text-muted-foreground">({orderPortalDraft.phone})</span>}
                         </div>
                         <button 
                           onClick={() => setIsSearchingCustomers(true)}
                           className="text-xs bg-white dark:bg-[#1E293B] border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                         >
                           Değiştir
                         </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Adı *</label>
                          <input placeholder="Müşteri Adı" value={orderPortalDraft.firstName || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, firstName: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Soyadı *</label>
                          <input placeholder="Müşteri Soyadı" value={orderPortalDraft.lastName || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, lastName: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Telefon</label>
                          <input placeholder="05XX XXX XX XX" value={orderPortalDraft.phone || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, phone: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">TC Kimlik No</label>
                          <input placeholder="11 Haneli TC" value={orderPortalDraft.tcNo || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, tcNo: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">E-Posta</label>
                          <input type="email" placeholder="ornek@email.com" value={orderPortalDraft.email || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, email: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Açık Adres</label>
                          <textarea placeholder="Mahalle, sokak, no..." value={orderPortalDraft.address || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, address: e.target.value })} rows={2} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optic Info Section */}
              {(orderPortalDraft.intentType === "PRESCRIPTION" || orderPortalDraft.intentType === "BOTH") && (
                <div className="p-4 rounded-2xl border border-border-color bg-surface/50 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5c9ca8]">Göz & Reçete Bilgileri</h4>
                  <div className="space-y-4">
                    <div className="bg-surface rounded-2xl p-4 border border-border-color shadow-sm">
                    <span className="text-[11px] uppercase font-bold text-orange-500 mb-3 block tracking-wide">Uzak Görüş</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-6 uppercase">SAĞ</span>
                        <input placeholder="SPH" value={orderPortalDraft.farRightSph || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, farRightSph: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="CYL" value={orderPortalDraft.farRightCyl || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, farRightCyl: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="AX" value={orderPortalDraft.farRightAx || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, farRightAx: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-6 uppercase">SOL</span>
                        <input placeholder="SPH" value={orderPortalDraft.farLeftSph || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, farLeftSph: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="CYL" value={orderPortalDraft.farLeftCyl || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, farLeftCyl: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="AX" value={orderPortalDraft.farLeftAx || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, farLeftAx: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                      </div>
                    </div>
                  </div>

                  {/* YAKIN */}
                  <div className="bg-surface rounded-2xl p-4 border border-border-color shadow-sm">
                    <span className="text-[11px] uppercase font-bold text-blue-500 mb-3 block tracking-wide">Yakın Görüş</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-6 uppercase">SAĞ</span>
                        <input placeholder="SPH" value={orderPortalDraft.nearRightSph || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, nearRightSph: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="CYL" value={orderPortalDraft.nearRightCyl || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, nearRightCyl: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="AX" value={orderPortalDraft.nearRightAx || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, nearRightAx: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-6 uppercase">SOL</span>
                        <input placeholder="SPH" value={orderPortalDraft.nearLeftSph || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, nearLeftSph: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="CYL" value={orderPortalDraft.nearLeftCyl || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, nearLeftCyl: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="AX" value={orderPortalDraft.nearLeftAx || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, nearLeftAx: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                      </div>
                    </div>
                  </div>

                  {/* DAİMİ */}
                  <div className="bg-surface rounded-2xl p-4 border border-border-color shadow-sm">
                    <span className="text-[11px] uppercase font-bold text-green-500 mb-3 block tracking-wide">Daimi Görüş</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-6 uppercase">SAĞ</span>
                        <input placeholder="SPH" value={orderPortalDraft.constantRightSph || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, constantRightSph: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="CYL" value={orderPortalDraft.constantRightCyl || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, constantRightCyl: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="AX" value={orderPortalDraft.constantRightAx || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, constantRightAx: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-6 uppercase">SOL</span>
                        <input placeholder="SPH" value={orderPortalDraft.constantLeftSph || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, constantLeftSph: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="CYL" value={orderPortalDraft.constantLeftCyl || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, constantLeftCyl: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="AX" value={orderPortalDraft.constantLeftAx || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, constantLeftAx: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* PD / PH */}
                    <div className="bg-surface rounded-2xl p-4 border border-border-color shadow-sm">
                      <span className="text-[11px] uppercase font-bold text-purple-500 mb-3 block tracking-wide">PD / PH</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="Sağ PD" value={orderPortalDraft.pdRight || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, pdRight: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="Sol PD" value={orderPortalDraft.pdLeft || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, pdLeft: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="Sağ PH" value={orderPortalDraft.phRight || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, phRight: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="Sol PH" value={orderPortalDraft.phLeft || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, phLeft: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                      </div>
                    </div>
                    {/* ADD */}
                    <div className="bg-surface rounded-2xl p-4 border border-border-color shadow-sm">
                      <span className="text-[11px] uppercase font-bold text-amber-500 mb-3 block tracking-wide">ADD (ADİSYON)</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="Sağ ADD" value={orderPortalDraft.addRight || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, addRight: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                        <input placeholder="Sol ADD" value={orderPortalDraft.addLeft || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, addLeft: e.target.value })} className="w-full bg-surface-light border border-border-color rounded-lg px-2 py-2.5 text-center text-sm font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm transition-all placeholder:text-muted-foreground/40" />
                      </div>
                    </div>
                  </div>

                  {/* Diğer Bilgiler */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <input placeholder="Cam Tipi (Örn: Progresif, Mineral)" value={orderPortalDraft.lensType || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, lensType: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                    <input placeholder="Kaplama (Örn: Antirefle)" value={orderPortalDraft.coating || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, coating: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                    <input placeholder="Doktor Adı Soyadı" value={orderPortalDraft.doctorName || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, doctorName: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                    <input placeholder="Hastane / Klinik" value={orderPortalDraft.hospitalName || ""} onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, hospitalName: e.target.value })} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#5c9ca8] focus:ring-2 focus:ring-[#5c9ca8]/20 shadow-sm transition-all" />
                  </div>
                </div>
              </div>
              )}
              {/* Product Section */}
              {(orderPortalDraft.intentType === "ORDER" || orderPortalDraft.intentType === "BOTH") && (
                <>
              <div className="p-4 rounded-2xl border border-border-color bg-surface/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5c9ca8]">Ürün & Sipariş Detayları</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Ürün Adı</label>
                    <input
                      type="text"
                      value={orderPortalDraft.productName}
                      onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, productName: e.target.value })}
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Ürün Kodu / Seri No</label>
                    <input
                      type="text"
                      value={orderPortalDraft.productCode}
                      onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, productCode: e.target.value })}
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Satış Fiyatı (TL)</label>
                    <input
                      type="text"
                      value={orderPortalDraft.totalPrice}
                      onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, totalPrice: e.target.value })}
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Kapora / Peşinat (TL)</label>
                    <input
                      type="text"
                      value={orderPortalDraft.downPayment}
                      onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, downPayment: e.target.value })}
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8]"
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Status Section */}
              <div className="p-4 rounded-2xl border border-border-color bg-surface/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5c9ca8]">Tarihler & Teslimat Durumu</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Satış Tarihi</label>
                    <input
                      type="date"
                      value={orderPortalDraft.saleDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, saleDate: e.target.value })}
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Teslimat Tarihi</label>
                    <input
                      type="date"
                      value={orderPortalDraft.deliveryDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, deliveryDate: e.target.value })}
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Teslimat Durumu</label>
                    <select
                      value={orderPortalDraft.deliveryStatus}
                      onChange={(e) => setOrderPortalDraft({ ...orderPortalDraft, deliveryStatus: e.target.value })}
                      className="w-full bg-background border border-border-color rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5c9ca8] font-medium"
                    >
                      {(orderPortalDraft.availableStatuses && orderPortalDraft.availableStatuses.length > 0
                        ? orderPortalDraft.availableStatuses
                        : ["Hazırlanıyor", "Teslime Hazır", "Teslim Edildi"]
                      ).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Installment Plan Schedule Table (Taksitlendirme Planı) */}
              <div className="p-4 rounded-2xl border border-border-color bg-surface/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5c9ca8]">Taksit & Ödeme Planı</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <select
                      value={orderPortalDraft.installmentPeriod || "AYLIK"}
                      onChange={(e) => {
                         const val = e.target.value;
                         setOrderPortalDraft({ ...orderPortalDraft, installmentPeriod: val });
                      }}
                      className="bg-background border border-border-color rounded-lg px-2 py-1 font-medium text-muted-foreground focus:outline-none mr-2"
                    >
                      <option value="AYLIK">Aylık</option>
                      <option value="HAFTALIK">Haftalık</option>
                      <option value="GÜNLÜK">Günlük</option>
                    </select>
                    <span className="text-muted-foreground font-medium">Taksit Sayısı:</span>
                    <select
                      value={orderPortalDraft.installmentCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 1;
                        const total = parseFloat(orderPortalDraft.totalPrice) || 0;
                        const dp = parseFloat(orderPortalDraft.downPayment) || 0;
                        const remaining = Math.max(0, total - dp);
                        const monthly = count > 0 ? Math.round(remaining / count) : remaining;
                        const period = orderPortalDraft.installmentPeriod || "AYLIK";
                        
                        const newSchedule = Array.from({ length: count }, (_, i) => {
                          const d = new Date();
                          if (period === "HAFTALIK") {
                            d.setDate(d.getDate() + (i + 1) * 7);
                          } else if (period === "GÜNLÜK") {
                            d.setDate(d.getDate() + (i + 1));
                          } else {
                            d.setMonth(d.getMonth() + i + 1);
                          }
                          return {
                            number: i + 1,
                            date: d.toISOString().split("T")[0],
                            amount: monthly
                          };
                        });

                        setOrderPortalDraft({
                          ...orderPortalDraft,
                          installmentCount: e.target.value,
                          installments: newSchedule
                        });
                      }}
                      className="bg-background border border-border-color rounded-lg px-2 py-1 font-bold text-[#5c9ca8] focus:outline-none"
                    >
                      <option value="1">Peşin / Tek Çekim</option>
                      <option value="2">2 Taksit</option>
                      <option value="3">3 Taksit</option>
                      <option value="6">6 Taksit</option>
                      <option value="12">12 Taksit</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {(orderPortalDraft.installments || [
                    { number: 1, date: "2026-08-06", amount: 5000 },
                    { number: 2, date: "2026-09-06", amount: 5000 },
                    { number: 3, date: "2026-10-06", amount: 5000 },
                  ]).map((inst, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 bg-background border border-border-color p-2.5 rounded-xl text-xs">
                      <span className="font-bold text-[#5c9ca8] w-24">
                        {inst.number}. Taksit
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-muted-foreground">Vade Tarihi:</span>
                        <input
                          type="date"
                          value={inst.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            const list = [...(orderPortalDraft.installments || [])];
                            if (list[i]) list[i].date = val;
                            setOrderPortalDraft({ ...orderPortalDraft, installments: list });
                          }}
                          className="bg-surface border border-border-color rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#5c9ca8]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Tutar:</span>
                        <input
                          type="number"
                          value={inst.amount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const list = [...(orderPortalDraft.installments || [])];
                            if (list[i]) list[i].amount = val;
                            setOrderPortalDraft({ ...orderPortalDraft, installments: list });
                          }}
                          className="w-24 bg-surface border border-border-color rounded-lg px-2.5 py-1 text-xs font-bold text-right focus:outline-none focus:border-[#5c9ca8]"
                        />
                        <span className="font-bold">TL</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-background border-t border-border-color flex justify-between items-center">
              <button
                onClick={() => setOrderPortalDraft(null)}
                className="px-4 py-2.5 text-sm rounded-xl border border-border-color text-muted-foreground font-bold hover:bg-surface transition-colors"
              >
                Vazgeç
              </button>

              <button
                onClick={async () => {
                  try {
                    const toastId = toast.loading("Sistem kaydediyor...");
                    let cusId = orderPortalDraft.customerId;
                    
                    // 1. Müşteri Kaydı (Yoksa)
                    if (!cusId) {
                      const cusRes = await fetch("/api/customers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          firstName: orderPortalDraft.firstName || "İsimsiz",
                          lastName: orderPortalDraft.lastName || "Müşteri",
                          phone: orderPortalDraft.phone ? orderPortalDraft.phone.replace(/\D/g,"") : "",
                          tcNo: orderPortalDraft.tcNo,
                          email: orderPortalDraft.email,
                          address: orderPortalDraft.address,
                          diseases: orderPortalDraft.diseases,
                          notes: orderPortalDraft.notes,
                          allowExisting: true,
                        }),
                      });
                      const cusData = await cusRes.json();
                      if (!cusRes.ok) throw new Error(cusData.error || "Müşteri kaydı başarısız");
                      cusId = cusData.id;
                    }

                    // 2. Reçete Kaydı
                    const hasEyeInfo = 
                      orderPortalDraft.farRightSph || orderPortalDraft.farRightCyl || orderPortalDraft.farRightAx ||
                      orderPortalDraft.farLeftSph || orderPortalDraft.farLeftCyl || orderPortalDraft.farLeftAx ||
                      orderPortalDraft.nearRightSph || orderPortalDraft.nearRightCyl || orderPortalDraft.nearRightAx ||
                      orderPortalDraft.nearLeftSph || orderPortalDraft.nearLeftCyl || orderPortalDraft.nearLeftAx ||
                      orderPortalDraft.constantRightSph || orderPortalDraft.constantRightCyl || orderPortalDraft.constantRightAx ||
                      orderPortalDraft.constantLeftSph || orderPortalDraft.constantLeftCyl || orderPortalDraft.constantLeftAx ||
                      orderPortalDraft.addRight || orderPortalDraft.addLeft ||
                      orderPortalDraft.pdRight || orderPortalDraft.pdLeft || orderPortalDraft.pdTotal ||
                      orderPortalDraft.phRight || orderPortalDraft.phLeft ||
                      orderPortalDraft.doctorName || orderPortalDraft.hospitalName || orderPortalDraft.lensType || orderPortalDraft.coating || orderPortalDraft.prescriptionNotes;

                    if (hasEyeInfo) {
                      const eyeRes = await fetch("/api/prescriptions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          customerId: cusId,
                          ...orderPortalDraft,
                          isPending: false
                        }),
                      });
                      if (!eyeRes.ok) throw new Error("Müşteri kaydedildi fakat reçete kaydedilemedi.");
                    }

                    // 3. Sipariş Kaydı
                    if (orderPortalDraft.productName || orderPortalDraft.totalPrice) {
                      const orderRes = await fetch("/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          customerId: cusId,
                          products: orderPortalDraft.productName,
                          productCode: orderPortalDraft.productCode,
                          totalPrice: parseFloat(String(orderPortalDraft.totalPrice)) || 0,
                          deposit: parseFloat(String(orderPortalDraft.downPayment)) || 0,
                          balance: Math.max(0, (parseFloat(String(orderPortalDraft.totalPrice)) || 0) - (parseFloat(String(orderPortalDraft.downPayment)) || 0)),
                          status: orderPortalDraft.deliveryStatus || "PENDING",
                          deliveryDate: orderPortalDraft.deliveryDate || null,
                          installmentCount: parseInt(String(orderPortalDraft.installmentCount)) || 1,
                          manualInstallments: orderPortalDraft.installments?.map(i => ({ amount: i.amount, dueDate: i.date })) || [],
                          installmentMode: orderPortalDraft.installments && orderPortalDraft.installments.length > 0 ? "MANUAL" : "AUTO"
                        }),
                      });
                      if (!orderRes.ok) throw new Error("Müşteri/reçete kaydedildi fakat sipariş kaydedilemedi.");
                    }

                    toast.success("Kayıt başarıyla tamamlandı!", { id: toastId });
                    setOrderPortalDraft(null);
                    setIsOpen(false);
                    router.push(`/admin/customers/${cusId}`);
                  } catch (e: any) {
                    toast.error(e.message || "Kayıt sırasında bir hata oluştu.");
                  }
                }}
                className="px-5 py-2.5 text-sm bg-gradient-to-r from-[#5c9ca8] to-[#2d6874] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                Kaydet & Tamamla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finance Portal Draft Modal */}
      {financePortalDraft && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background border border-border-color w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Finans İşlemi Onayı
              </h3>
              <button onClick={() => setFinancePortalDraft(null)} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-muted-foreground">Tutar (TL)</label>
                 <input type="number" value={financePortalDraft.amount} onChange={e => setFinancePortalDraft({...financePortalDraft, amount: parseFloat(e.target.value) || 0})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 font-bold text-lg" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-muted-foreground">Kategori / Açıklama</label>
                 <input type="text" value={financePortalDraft.description} onChange={e => setFinancePortalDraft({...financePortalDraft, description: e.target.value})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-muted-foreground">İşlem Türü</label>
                 <select value={financePortalDraft.type} onChange={e => setFinancePortalDraft({...financePortalDraft, type: e.target.value as any})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2">
                   <option value="INCOME">Gelir</option>
                   <option value="EXPENSE">Gider</option>
                 </select>
               </div>
            </div>
            <div className="p-4 border-t border-border-color flex justify-end gap-3">
               <button onClick={() => setFinancePortalDraft(null)} className="px-4 py-2 text-muted-foreground font-bold hover:bg-surface rounded-xl">Vazgeç</button>
               <button onClick={async () => {
                 try {
                   const toastId = toast.loading("Finans kaydediliyor...");
                   const res = await fetch("/api/ai/save-finance", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify(financePortalDraft)
                   });
                   if (!res.ok) throw new Error("Kaydedilemedi");
                   toast.success("Finans işlemi kaydedildi!", { id: toastId });
                   setFinancePortalDraft(null);
                   setIsOpen(false);
                 } catch (e: any) {
                   toast.error(e.message || "Hata oluştu.");
                 }
               }} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Portal Draft Modal */}
      {inventoryPortalDraft && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background border border-border-color w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Stok İşlemi Onayı
              </h3>
              <button onClick={() => setInventoryPortalDraft(null)} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-muted-foreground">Ürün Adı</label>
                 <input type="text" value={inventoryPortalDraft.productName} onChange={e => setInventoryPortalDraft({...inventoryPortalDraft, productName: e.target.value})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2 font-bold" />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-muted-foreground">Miktar (Adet)</label>
                   <input type="number" value={inventoryPortalDraft.quantity} onChange={e => setInventoryPortalDraft({...inventoryPortalDraft, quantity: parseInt(e.target.value) || 0})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-muted-foreground">İşlem Türü</label>
                   <select value={inventoryPortalDraft.type} onChange={e => setInventoryPortalDraft({...inventoryPortalDraft, type: e.target.value as any})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2">
                     <option value="ADD">Stok Ekle</option>
                     <option value="UPDATE">Stok Güncelle</option>
                   </select>
                 </div>
               </div>
            </div>
            <div className="p-4 border-t border-border-color flex justify-end gap-3">
               <button onClick={() => setInventoryPortalDraft(null)} className="px-4 py-2 text-muted-foreground font-bold hover:bg-surface rounded-xl">Vazgeç</button>
               <button onClick={async () => {
                 try {
                   const toastId = toast.loading("Stok kaydediliyor...");
                   const res = await fetch("/api/ai/save-inventory", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify(inventoryPortalDraft)
                   });
                   if (!res.ok) throw new Error("Kaydedilemedi");
                   toast.success("Stok işlemi kaydedildi!", { id: toastId });
                   setInventoryPortalDraft(null);
                   setIsOpen(false);
                 } catch (e: any) {
                   toast.error(e.message || "Hata oluştu.");
                 }
               }} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
