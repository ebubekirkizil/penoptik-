import { Users, Building2, UserCircle, Activity, ChevronDown, ShieldCheck, Mail, Clock, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AllUsersPage() {
  // Fetch all firms, their user counts, users, and recent activities
  const firms = await prisma.firm.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { users: true }
      },
      users: {
        orderBy: { createdAt: 'desc' },
        include: {
          activityLogs: {
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        }
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tüm Alt Kullanıcılar (Müxteri Panelleri)</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Sistemdeki firmaların (müxterilerin) açtığı alt personel hesapları ve limitleri.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-100 dark:border-indigo-500/20">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-indigo-900 dark:text-indigo-300">{firms.length} Kayıtlı Firma</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {firms.length === 0 ? (
          <div className="bg-white dark:bg-[#1E293B] p-10 rounded-3xl border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Henüz firma bulunmuyor</h3>
            <p className="text-slate-500 mt-2">Sisteme kayıtlı herhangi bir firma ve kullanıcı bulunamadı.</p>
          </div>
        ) : (
          firms.map((firm) => {
            const currentUsers = firm._count.users;
            const maxUsers = (firm as any).maxUsers || 5;
            const usagePercent = Math.min((currentUsers / maxUsers) * 100, 100);
            const isNearLimit = usagePercent >= 80;

            return (
              <details key={firm.id} className="group bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden open:shadow-md transition-all">
                <summary className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white group-open:text-indigo-600 transition-colors">{firm.name}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${firm.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                          {firm.isActive ? "Aktif Firma" : "Pasif"}
                        </span>
                        <span className="text-xs text-slate-500">Alan Adı: {firm.domain || "Yok"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Kullanıcı Limiti:</span>
                        <span className={`text-sm font-black ${isNearLimit ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                          {currentUsers} / {maxUsers}
                        </span>
                      </div>
                      <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isNearLimit ? 'bg-rose-500' : 'bg-indigo-500'}`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-open:rotate-180 transition-transform">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </summary>

                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800">
                  <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Firmaya Bağlı Personeller & Aktiviteler</h3>
                    
                    {firm.users.length === 0 ? (
                      <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                        <p className="text-slate-500 text-sm">Bu firmaya henüz hiç alt kullanıcı (personel) eklenmemix.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {firm.users.map(user => (
                          <div key={user.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                                  <UserCircle className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {user.firstName} {user.lastName}
                                    {user.role === "FIRM_ADMIN" && (
                                      <span title="Firma Yöneticisi">
                                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                    <Mail className="w-3 h-3" /> {user.email}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-semibold px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                                {user.role}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                <Activity className="w-3 h-3" /> Son Aktiviteleri (Log)
                              </div>
                              {user.activityLogs.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">Henüz bir eylem gerçeklextirmedi.</p>
                              ) : (
                                <ul className="space-y-2">
                                  {user.activityLogs.map(log => (
                                    <li key={log.id} className="flex items-start gap-2 text-sm">
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                      <span className="text-slate-700 dark:text-slate-300">{log.action}</span>
                                      <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto shrink-0">
                                        <Clock className="w-3 h-3" /> 
                                        {new Date(log.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}
