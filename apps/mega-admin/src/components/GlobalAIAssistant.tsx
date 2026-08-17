"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePathname } from 'next/navigation';

export function GlobalAIAssistant() {
  const pathname = usePathname();
  const isSuperAdmin = pathname?.startsWith('/super-admin');

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{role: "system"|"user"|"ai", content: string}[]>([
    { role: "system", content: `Merhaba! Ben Akıllı Asistan. İxletmenizle ilgili verileri analiz edebilir, raporlar sunabilir ve günlük ixlemlerinizi hızlandırabilirim.\n\nAxağıdaki hızlı sorulardan birini seçebilir veya öğrenmek istediğiniz konuyu doğrudan axağıya yazabilirsiniz.` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, { role: "ai", content: "" }]);

      const response = await fetch('/api/tax/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: isSuperAdmin ? 'super-admin' : 'tenant',
          messages: messages
            .filter(m => m.role !== 'system')
            .concat([{ role: 'user', content: userMessage }])
            .map(m => ({ role: m.role, text: m.content }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.text || 'API / Yapay Zeka Sunucu Hatası');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
         const data = await response.json();
         setMessages(prev => {
           const newMessages = [...prev];
           newMessages[newMessages.length - 1].content = data.text || "Bir hata oluxtu.";
           return newMessages;
         });
      } else {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          let aiFullResponse = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            aiFullResponse += chunk;
            
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1].content = aiFullResponse;
              return newMessages;
            });
          }
        }
      }
    } catch (error: any) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = error.message || "Üzgünüm, xu an bir bağlantı sorunu (API/IP Hatası) yaxıyorum. Lütfen daha sonra tekrar deneyin.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-[10000] w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.8)] transition-shadow group cursor-grab active:cursor-grabbing"
        drag
        dragMomentum={false}
        dragElastic={0.1}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        onClick={toggleOpen}
        style={{ pointerEvents: isOpen ? 'none' : 'auto' }}
      >
        <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed z-[10000] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
              isExpanded 
                ? "inset-0 w-full h-full rounded-none sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[800px] sm:h-[85vh] sm:rounded-2xl sm:border sm:border-slate-200 sm:dark:border-slate-800" 
                : "bottom-4 right-4 w-[calc(100vw-32px)] h-[500px] max-h-[75vh] rounded-2xl border border-slate-200 dark:border-slate-800 sm:bottom-6 sm:right-6 sm:w-[400px] sm:max-h-[80vh]"
            }`}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between text-white shrink-0 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Akıllı Asistan</h3>
                  <p className="text-[10px] font-medium text-indigo-200">Her zaman yanınızda</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={toggleOpen} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
              {messages.filter(msg => !(msg.role === 'system' && messages.length > 1)).map((msg, idx) => (
                <React.Fragment key={idx}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-br-sm shadow-md max-w-[85%]" 
                        : msg.role === "system"
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 w-full max-w-[90%] mx-auto shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-100 dark:border-slate-700 shadow-sm w-full max-w-full sm:max-w-[90%]"
                    }`}>
                      {msg.role === 'ai' || msg.role === 'system' ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({node, ...props}) => <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-700"><table className="w-full text-left border-collapse text-xs sm:text-sm" {...props} /></div>,
                            th: ({node, ...props}) => <th className="border-b dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 p-2.5 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap" {...props} />,
                            td: ({node, ...props}) => <td className="border-b dark:border-slate-700 p-2.5 text-slate-600 dark:text-slate-400" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1.5 text-slate-600 dark:text-slate-400" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1.5 text-slate-600 dark:text-slate-400" {...props} />,
                            h3: ({node, ...props}) => <h3 className="font-bold text-base mt-4 mb-2 text-slate-800 dark:text-slate-200" {...props} />,
                            h4: ({node, ...props}) => <h4 className="font-semibold text-sm mt-3 mb-1.5 text-slate-800 dark:text-slate-200" {...props} />,
                            p: ({node, ...props}) => <p className="mb-3 last:mb-0 text-slate-600 dark:text-slate-300" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-indigo-600 dark:text-indigo-400" {...props} />,
                            a: ({node, ...props}) => <a className="inline-block mt-1 mr-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800 no-underline" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>

                  {/* Quick Actions (Suggestions) IN THE CHAT AREA */}
                  {idx === 0 && messages.length < 3 && (
                    <div className="flex flex-wrap gap-2 mt-4 px-2 max-w-[95%] mx-auto justify-start">
                      {isSuperAdmin ? (
                        <>
                          <button onClick={() => setInput("Sistemde kaç müxterimiz (firma) kayıtlı?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Firma Sayısı
                          </button>
                          <button onClick={() => setInput("Sistemde kimler kayıtlı? İsimlerini listele.")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Kayıtlı Firmalar
                          </button>
                          <button onClick={() => setInput("Vergi texvikleri ve avantajları nelerdir?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Vergi Texvikleri
                          </button>
                          <button onClick={() => setInput("Şahıs xirketi mi, Limited xirketi mi daha avantajlı?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Şirket Türleri
                          </button>
                          <button onClick={() => setInput("Aylık düzenli gelirimiz (MRR) nedir?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Aylık Gelir
                          </button>
                          <button onClick={() => setInput("Sistemde toplam kaç personel/kullanıcı var?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Personel Sayısı
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setInput("Hazırlanmayı bekleyen veya aktif siparixlerimiz var mı?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Bekleyen Siparixler
                          </button>
                          <button onClick={() => setInput("Kârlılık durumumuz nedir?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Kâr Durumu
                          </button>
                          <button onClick={() => setInput("Bu ayki genel gider durumumuz nedir?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Gider Raporu
                          </button>
                          <button onClick={() => setInput("Stokta azalan veya bitmek üzere olan ürünler var mı?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Stok Durumu
                          </button>
                          <button onClick={() => setInput("Personel performans raporunu detaylı olarak incele.")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            Performans
                          </button>
                          <button onClick={() => setInput("En çok satan veya en popüler ürünümüz hangisi?")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm">
                            En Çok Satanlar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLoading ? "Akıllı Asistan düxünüyor..." : "Sisteme veya hukuka dair bir xey sorun..."}
                  disabled={isLoading}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
