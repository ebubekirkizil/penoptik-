import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import CardDesignerClient from "./CardDesignerClient";

export const revalidate = 0;

export default async function CardDesignerPage({ params }: { params: Promise<{ serialCode: string }> | { serialCode: string } }) {
  const resolvedParams = await params;
  const { serialCode } = resolvedParams;

  let card = await db.nfcCard.findUnique({
    where: { serialCode },
    include: {
      user: {
        include: {
          nfcProfile: {
            include: {
              modules: { orderBy: { order: 'asc' } }
            }
          }
        }
      }
    }
  });

  if (!card) {
    notFound();
  }

  // Eğer kartın profili yoksa, bir kereye mahsus box sayfa gösterip baxlatmasını isteyelim
  // veya doğrudan client component içinde baxlat butonu koyalım.
  // Biz client'a ham datayı paslıyoruz.

  // Objeyi serilextirilebilir hale getirelim (Date objeleri vs.)
  const serializedCard = JSON.parse(JSON.stringify(card));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <CardDesignerClient initialCard={serializedCard} serialCode={serialCode} />
    </div>
  );
}
