import { prisma } from "@/lib/mock-prisma";
import LogTable from "./LogTable";

export default async function SystemLogsPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { firstName: true, lastName: true, role: true, email: true, userCode: true }
      }
    }
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-foreground">Sistem Logları</h1>
        <p className="text-muted-foreground text-sm">Personel tarafından yapılan son 100 ixlem burada listelenir. Detayları görmek için satıra veya "Göz" simgesine tıklayın.</p>
      </div>

      <LogTable logs={JSON.parse(JSON.stringify(logs))} />
    </div>
  );
}
