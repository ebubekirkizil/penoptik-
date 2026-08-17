"use client";

import { useState } from "react";
import { Search, Filter, ShieldAlert, MessageSquare, CheckCircle2, Clock, MoreVertical, Building2, X, Send } from "lucide-react";
import toast from "react-hot-toast";

type Ticket = {
  id: string;
  firm: string;
  subject: string;
  status: string;
  priority: string;
  date: string;
  messages: number;
  description: string;
};

export default function TicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");

  const tickets: Ticket[] = [
    { 
      id: "TCK-1045", firm: "Pen Optik", subject: "E-Fatura Modülü Hk.", status: "Açık", priority: "Yüksek", date: "Bugün, 14:30", messages: 2,
      description: "Merhaba, yeni fatura keserken VKN numarasını kabul etmiyor, sistem hata veriyor. Acil destek rica ederiz." 
    },
    { 
      id: "TCK-1044", firm: "Vizyon Optik Ltd.", subject: "KDV Oran Güncellemesi", status: "Beklemede", priority: "Orta", date: "Dün, 16:45", messages: 4,
      description: "Ürünlere girdiğimiz KDV oranları otomatik %20'ye yuvarlanmıyor, manuel düzeltme yapabiliyor muyuz?"
    },
    { 
      id: "TCK-1043", firm: "Ege Sağlık A.Ş.", subject: "Yeni Personel Yetkilendirme", status: "Çözüldü", priority: "Düxük", date: "29 Haz 2026", messages: 5,
      description: "Yeni bir göz doktoru ekledik ama reçete girme yetkisini bulamadık, nereden açabiliriz?"
    },
    { 
      id: "TCK-1042", firm: "Davut Kundura", subject: "Siparix Sayfası Yavaxlığı", status: "Çözüldü", priority: "Yüksek", date: "28 Haz 2026", messages: 8,
      description: "Siparix listesini açtığımda 10 saniye bekliyorum, sistem çok yavax. Yardımcı olur musunuz?"
    },
  ];

  const handleReply = () => {
    if(!replyText.trim()) return;
    toast.success("Yanıtınız baxarıyla firmaya iletildi.");
    setReplyText("");
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Destek Talepleri</h1>
          </div>
          <p className="text-slate-500 text-sm">Müxterilerden gelen sorun, talep ve geri bildirimleri tek merkezden yönetin.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Açık Talepler</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Bekleyen Yanıt</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">4</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Çözülen Talepler</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">1,845</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-5 rounded-2xl text-white shadow-lg shadow-indigo-500/20 flex flex-col justify-center">
          <p className="text-indigo-100 text-sm font-medium">Ortalama Çözüm Süresi</p>
          <p className="text-2xl font-black mt-1">1s 45dk</p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Talep no, firma veya anahtar kelime ara..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtrele</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Bilet ID</th>
                <th className="px-6 py-4 font-semibold">Firma</th>
                <th className="px-6 py-4 font-semibold">Konu Baxlığı</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Öncelik</th>
                <th className="px-6 py-4 font-semibold">Tarih</th>
                <th className="px-6 py-4 font-semibold text-right">İxlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.map((ticket, i) => (
                <tr 
                  key={i} 
                  onDoubleClick={() => setSelectedTicket(ticket)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  title="Detayları görmek için çift tıklayın"
                >
                  <td className="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400 font-medium">{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">{ticket.firm}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-700 dark:text-slate-300">{ticket.subject}</span>
                    <span className="ml-2 text-xs text-slate-400">({ticket.messages} Mesaj)</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg
                      ${ticket.status === 'Açık' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : 
                        ticket.status === 'Beklemede' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        ticket.priority === 'Yüksek' ? 'bg-rose-500' : 
                        ticket.priority === 'Orta' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></div>
                      <span className="text-slate-600 dark:text-slate-400">{ticket.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{ticket.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal / Slide-over */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">{selectedTicket.id}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{selectedTicket.firm}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h2>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 max-h-[400px] overflow-y-auto space-y-6">
              {/* Customer Message */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-600 dark:text-slate-300 font-bold">
                  {selectedTicket.firm.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedTicket.firm} (Müxteri)</span>
                    <span className="text-xs text-slate-500">{selectedTicket.date}</span>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedTicket.description}
                  </div>
                </div>
              </div>

              {/* Mega Admin Reply (Simulated previous reply if any) */}
              {selectedTicket.messages > 2 && (
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                    SW
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500">Dün, 15:00</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Sentient Wire (Destek)</span>
                    </div>
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl rounded-tr-none border border-indigo-100 dark:border-indigo-500/20 text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed text-right">
                      Talebiniz alınmıxtır, teknik ekibimiz konu üzerinde çalıxıyor.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
              <div className="flex gap-3">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Müxteriye yanıtınızı yazın..."
                  className="flex-1 resize-none h-12 py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                ></textarea>
                <button 
                  onClick={handleReply}
                  className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md shadow-indigo-500/20"
                >
                  <Send className="w-4 h-4" /> Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
