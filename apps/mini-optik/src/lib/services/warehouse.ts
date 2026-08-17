import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getDefaultWarehouse() {
  const session = await getSession();
  if (!session || !session.firmId) {
    throw new Error("Yetkisiz erişim.");
  }

  const firmId = session.firmId;

  // Firmanın depolarını getir
  const warehouses = await prisma.warehouse.findMany({
    where: { FirmId: firmId },
    orderBy: { createdAt: "asc" }
  });

  if (warehouses.length > 0) {
    return warehouses[0];
  }

  // Eğer hiç deposu yoksa, otomatik olarak 'Ana Depo' oluştur.
  const newWarehouse = await prisma.warehouse.create({
    data: {
      FirmId: firmId,
      name: "Ana Depo",
      code: "DEP-01",
      address: "Merkez"
    }
  });

  return newWarehouse;
}

export async function getAllWarehouses() {
  const session = await getSession();
  if (!session || !session.firmId) return [];

  const warehouses = await prisma.warehouse.findMany({
    where: { FirmId: session.firmId },
    orderBy: { name: "asc" }
  });

  if (warehouses.length === 0) {
    const defaultWarehouse = await getDefaultWarehouse();
    return [defaultWarehouse];
  }

  return warehouses;
}
