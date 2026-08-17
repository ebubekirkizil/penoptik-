import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, UserCircle2 } from "lucide-react";
import HRDetailClient from "./HRDetailClient";

export default async function HRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const firmId = session?.firmId;

  if (!firmId) return null;

  const employee = await prisma.user.findFirst({
    where: { id, firmId },
    include: {
      employeeShifts: { orderBy: { date: "desc" } },
      payrolls: { orderBy: [ { year: "desc" }, { month: "desc" } ] }
    }
  });

  if (!employee) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/hr" className="p-2 hover:bg-muted/10 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCircle2 className="w-6 h-6 text-indigo-500" /> {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {employee.position || (employee.role === "FIRM_ADMIN" ? "Yönetici" : "Personel")} | 
            Taban Maaş: <span className="font-bold">{employee.salary || 0} ₺</span> | 
            SGK Kesintisi: <span className="font-bold">%{employee.sgkTaxRate}</span>
          </p>
        </div>
      </div>

      <HRDetailClient 
        employee={employee} 
        shifts={employee.employeeShifts} 
        payrolls={employee.payrolls} 
      />
    </div>
  );
}
