// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBlindIndex } from "@/lib/crypto";
import { getSession } from "@/lib/auth";

/**
 * Admin-only: Tum musteri kayitlarinin eksik phoneHash/firstNameHash/lastNameHash degerlerini doldurur.
 * GET /api/admin/backfill-hashes
 */
export async function GET() {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "FIRM_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  let processed = 0;
  let updated = 0;
  let errors = 0;

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { phoneHash: null },
        { firstNameHash: null },
        { lastNameHash: null },
      ],
    },
    select: {
      id: true,
      phone: true,
      firstName: true,
      lastName: true,
      phoneHash: true,
      firstNameHash: true,
      lastNameHash: true,
    },
  });

  for (const customer of customers) {
    processed++;
    try {
      if (!customer.phoneHash && customer.phone) {
        const cleanPhone = customer.phone.replace(/\D/g, "");
        const hash = createBlindIndex(cleanPhone);
        if (hash) {
          await prisma.$executeRaw`UPDATE "Customer" SET "phoneHash" = ${hash} WHERE "id" = ${customer.id} AND "phoneHash" IS NULL`;
          updated++;
        }
      }

      if (!customer.firstNameHash && customer.firstName) {
        const hash = createBlindIndex(customer.firstName);
        if (hash) {
          await prisma.$executeRaw`UPDATE "Customer" SET "firstNameHash" = ${hash} WHERE "id" = ${customer.id} AND "firstNameHash" IS NULL`;
        }
      }

      if (!customer.lastNameHash && customer.lastName) {
        const hash = createBlindIndex(customer.lastName);
        if (hash) {
          await prisma.$executeRaw`UPDATE "Customer" SET "lastNameHash" = ${hash} WHERE "id" = ${customer.id} AND "lastNameHash" IS NULL`;
        }
      }
    } catch (err) {
      console.error("Backfill error for customer", customer.id, err);
      errors++;
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    updated,
    errors,
    message: `${processed} musteri islendi, ${updated} phoneHash guncellendi, ${errors} hata.`,
  });
}
