import InventoryClient from "./InventoryClient";

export const metadata = {
  title: "Stok Takibi - Penoptik",
};

export default function InventoryPage() {
  return <InventoryClient initialTab="INVENTORY" />;
}
