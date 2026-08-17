// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { ShieldAlert, Phone, Calendar, User } from "lucide-react";
import PrescriptionVerifyDetailForm from "@/components/PrescriptionVerifyDetailForm";
import CustomerProfileVerifyCard from "@/components/CustomerProfileVerifyCard";


export const fetchCache = "force-no-store";

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const whereClause: any = { isPending: true };
  if (q) {
    whereClause.customer = {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const pendingVerifications = await prisma.prescription.findMany({
    where: whereClause,
    include: {
      customer: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const profileWhereClause: any = { status: "PENDING" };
  if (q) {
    profileWhereClause.customer = {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const pendingProfileVerifications = await prisma.customerVerification.findMany({
    where: profileWhereClause,
    include: {
      customer: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalPending = pendingVerifications.length + pendingProfileVerifications.length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-warning" />
            Bekleyen Doğrulamalar
          </h1>
          <p className="text-muted-foreground mt-1">Müşterilerin web sitesinden girdiği ve henüz onaylanmamış göz ölçümleri.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-warning/10 text-warning px-4 py-2.5 rounded-xl border border-warning/20 font-bold flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
            {totalPending} Bekleyen İşlem
          </div>
        </div>
      </div>

      {totalPending === 0 ? (
        <div className="bg-white dark:bg-surface shadow-sm dark:bg-surface rounded-2xl p-16 text-center ">
          <div className="w-20 h-20 rounded-full bg-white/50 dark:bg-surface-light flex items-center justify-center mx-auto mb-5 ">
            <ShieldAlert className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Harika! Bekleyen İşlem Yok</h3>
          <p className="text-muted-foreground">Şu anda onayınızı bekleyen herhangi bir doğrulama işlemi bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingProfileVerifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <User className="w-5 h-5 text-primary" />
                Profil Güncellemeleri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingProfileVerifications.map((verification) => (
                  <CustomerProfileVerifyCard key={verification.id} verification={verification} />
                ))}
              </div>
            </div>
          )}

          {pendingVerifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <ShieldAlert className="w-5 h-5 text-warning" />
                Göz Ölçümleri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendingVerifications.map((rx) => (
            <div key={rx.id} className="bg-white dark:bg-surface shadow-sm dark:bg-surface rounded-2xl border border-warning/30 overflow-hidden flex flex-col shadow-[0_0_15px_rgba(var(--warning-rgb),0.05)]">
              {/* Card Header (Customer Info) */}
              <div className="p-4  bg-white/30 dark:bg-surface flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center font-bold text-[#1B242A] flex-shrink-0">
                    {rx.customer?.firstName?.charAt(0) || '?'}{rx.customer?.lastName?.charAt(0) || ''}
                  </div>
                  <div>
                    <p className="font-bold text-foreground line-clamp-1" title={`${rx.customer?.firstName || 'Bilinmeyen'} ${rx.customer?.lastName || 'Müşteri'}`}>
                      {rx.customer?.firstName || 'Bilinmeyen'} {rx.customer?.lastName || 'Müşteri'}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {rx.customer?.phone || '-'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 mb-1">
                    <Calendar className="w-3 h-3" />
                    {new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(rx.createdAt))}
                  </p>
                  <div className="bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></div>
                    <p className="text-[10px] font-bold text-warning uppercase">Bekliyor</p>
                  </div>
                </div>
              </div>

              {/* Quick Summary of Eye Info */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="bg-background/50 rounded-xl p-3  grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Amaç</span>
                    <span className="font-medium">{"Belirtilmedi"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Cam Tipi</span>
                    <span className="font-medium">{rx.lensType}</span>
                  </div>
                </div>
                
                {rx.notes && (
                  <div className="bg-warning/5 p-3 rounded-xl border border-warning/10 text-xs text-warning/90">
                    <span className="font-bold block mb-1">Not:</span>
                    <span className="italic line-clamp-3">"{rx.notes}"</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-border-color bg-white/50 dark:bg-surface-light">
                <PrescriptionVerifyDetailForm prescription={{
                  id: rx.id,
                  lensType: rx.lensType,
                  farRightSph: rx.farRightSph,
                  farRightCyl: rx.farRightCyl,
                  farRightAx: rx.farRightAx,
                  farLeftSph: rx.farLeftSph,
                  farLeftCyl: rx.farLeftCyl,
                  farLeftAx: rx.farLeftAx,
                  pdRight: rx.pdRight,
                  pdLeft: rx.pdLeft,
                  pdTotal: rx.pdTotal,
                  phRight: rx.phRight,
                  phLeft: rx.phLeft,
                  doctorName: rx.doctorName,
                  hospitalName: rx.hospitalName,
                  notes: rx.notes
                }} />
              </div>
            </div>
          ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
