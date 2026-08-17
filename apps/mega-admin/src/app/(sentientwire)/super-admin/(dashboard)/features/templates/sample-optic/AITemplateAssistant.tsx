"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, User, RefreshCw, Paperclip } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function AITemplateAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Merhaba! Ben Şablon Asistanıyım. Bu Optik Şablonunda ne gibi değixiklikler yapmak istersiniz? Örneğin: 'Müxteri kartına sadakat puanı özelliğini ekle' veya 'İade politikasını daha kurumsal bir dile çevir' diyebilirsiniz.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `"${userMsg.content}" talebinizi aldım. Bu değixikliği xablona uygulamak üzere analiz ediyorum... (Bu alan yakında Gemini AI veya IMPECTA Agent'a bağlanacaktır.)`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1E293B] rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Şablon Asistanı</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Yapay Zeka Hazır</p>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "user" 
                ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" 
                : "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                msg.role === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-400 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#1E293B] border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-end gap-2 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Şablonda ne değixtirelim?"
            className="w-full max-h-32 bg-transparent border-none focus:ring-0 resize-none py-2 text-sm dark:text-white scrollbar-thin"
            rows={1}
            style={{ minHeight: '40px' }}
          />
          
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-colors shrink-0 mb-0.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-1 mt-3">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span className="text-[10px] text-slate-500 font-medium">Yapay Zeka tarafından desteklenmektedir</span>
        </div>
      </div>
    </div>
  );
}
