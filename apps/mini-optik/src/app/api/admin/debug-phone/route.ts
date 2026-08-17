// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt, createBlindIndex } from "@/lib/crypto";
import { getSession } from "@/lib/auth";

/**
 * Debug endpoint - sadece admin kullanir
 * GET /api/admin/debug-phone?phone=05323694954
 * Bir telefon numarasini arar, ham DB degerlerini gosterir, sorun ne oldugunu anlatiyor.
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "FIRM_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  const url = new URL(request.url);
  const inputPhone = (url.searchParams.get("phone") || "").replace(/\D/g, "");

  if (!inputPhone) {
    return NextResponse.json({ error: "phone parametresi gerekli. Ornek: ?phone=05323694954" }, { status: 400 });
  }

  const targetNorms = [
    inputPhone,
    inputPhone.startsWith("0") ? inputPhone.substring(1) : "0" + inputPhone,
  ];

  // 1) Ham DB degerleri
  const rawRows = await prisma.$queryRaw`
    SELECT id, phone, "phoneHash", "firstName", "lastName" FROM "Customer" WHERE phone IS NOT NULL LIMIT 50
  ` as { id: string; phone: string; phoneHash: string | null; firstName: string; lastName: string }[];

  const results = rawRows.map(row => {
    const decryptedPhone = decrypt(row.phone);
    const normalizedDecrypted = decryptedPhone.replace(/\D/g, "");
    const isMatch = targetNorms.includes(normalizedDecrypted);
    const decryptedFirst = decrypt(row.firstName || "");
    const decryptedLast = decrypt(row.lastName || "");
    return {
      id: row.id,
      rawPhone: row.phone,
      decryptedPhone,
      normalizedDecrypted,
      hasPhoneHash: !!row.phoneHash,
      phoneHash: row.phoneHash,
      decryptedName: `${decryptedFirst} ${decryptedLast}`,
      isMatch,
    };
  });

  const matchingCustomers = results.filter(r => r.isMatch);

  // 2) Hash ile arama testi
  const computedHashes = targetNorms.map(p => ({ phone: p, hash: createBlindIndex(p) }));
  const hashMatches = await prisma.$queryRaw`
    SELECT id, "phoneHash" FROM "Customer" WHERE "phoneHash" = ANY(${targetNorms.map(p => createBlindIndex(p)).filter(Boolean)})
  `.catch(() => "Hash arama hata verdi");

  return NextResponse.json({
    inputPhone,
    targetNorms,
    computedHashes,
    totalCustomersScanned: rawRows.length,
    matchingCustomers,
    hashMatches,
    encryptionKeySet: !!process.env.ENCRYPTION_KEY,
    blindIndexSaltSet: !!process.env.BLIND_INDEX_SALT,
  }, { status: 200 });
}
