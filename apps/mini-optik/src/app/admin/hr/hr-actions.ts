"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createShift(userId: string, data: { date: string, checkIn?: string, checkOut?: string, overtimeHours?: number }) {
  const session = await getSession();
  if (!session?.firmId) throw new Error("Unauthorized");

  // Format date correctly
  const shiftDate = new Date(data.date);
  
  await prisma.employeeShift.create({
    data: {
      userId,
      date: shiftDate,
      checkIn: data.checkIn ? new Date(`${data.date}T${data.checkIn}:00`) : null,
      checkOut: data.checkOut ? new Date(`${data.date}T${data.checkOut}:00`) : null,
      overtimeHours: data.overtimeHours || 0,
    }
  });

  revalidatePath(`/admin/hr/${userId}`);
  return { success: true };
}

export async function deleteShift(shiftId: string, userId: string) {
  const session = await getSession();
  if (!session?.firmId) throw new Error("Unauthorized");

  await prisma.employeeShift.delete({ where: { id: shiftId } });
  revalidatePath(`/admin/hr/${userId}`);
  return { success: true };
}

export async function createPayroll(userId: string, data: { month: number, year: number, baseSalary: number, bonus: number, sgkTax: number }) {
  const session = await getSession();
  if (!session?.firmId) throw new Error("Unauthorized");

  const netPay = data.baseSalary + data.bonus - data.sgkTax;

  const payroll = await prisma.payroll.create({
    data: {
      userId,
      month: data.month,
      year: data.year,
      baseSalary: data.baseSalary,
      bonus: data.bonus,
      sgkTax: data.sgkTax,
      netPay
    },
    include: { user: true }
  });

  // Create Planned Finance Transactions
  // 1. For Net Salary + Bonus (Payable to Employee)
  await prisma.financeTransaction.create({
    data: {
      firmId: session.firmId,
      type: "EXPENSE",
      amount: netPay,
      category: "SALARY",
      description: `${data.month}/${data.year} - ${payroll.user.firstName} ${payroll.user.lastName} Maaş ve Prim`,
    }
  });

  // 2. For SGK Tax (Payable to State)
  if (data.sgkTax > 0) {
    await prisma.financeTransaction.create({
      data: {
        firmId: session.firmId,
        type: "EXPENSE",
        amount: data.sgkTax,
        category: "TAX",
        description: `${data.month}/${data.year} - ${payroll.user.firstName} ${payroll.user.lastName} SGK/Vergi Kesintisi`,
      }
    });
  }

  revalidatePath(`/admin/hr/${userId}`);
  revalidatePath("/admin/finance/transactions");
  return { success: true };
}

export async function markPayrollAsPaid(payrollId: string, userId: string) {
  const session = await getSession();
  if (!session?.firmId) throw new Error("Unauthorized");

  await prisma.payroll.update({
    where: { id: payrollId },
    data: { isPaid: true, paidAt: new Date() }
  });
  
  revalidatePath(`/admin/hr/${userId}`);
  return { success: true };
}
