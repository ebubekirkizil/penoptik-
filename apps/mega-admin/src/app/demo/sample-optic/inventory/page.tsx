// @ts-nocheck
import { Suspense } from "react";
import InventoryClient from "./InventoryClient";

export default async function InventoryPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;
  const tab = params?.tab || "INVENTORY";
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Yükleniyor...</div>}>
      <InventoryClient initialTab={tab} />
    </Suspense>
  );
}
