import { redirect } from "next/navigation";
import { hasModule } from "@/lib/permissions";

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
