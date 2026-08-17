import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FirmTrackClient } from "./FirmTrackClient";

export default async function FirmTrackPage({ params }: { params: { slug: string } }) {
  const firm = await prisma.firm.findFirst({
    where: {
      domain: params.slug,
      isActive: true,
    },
    select: {
      name: true,
      domain: true,
    }
  });

  if (!firm) {
    notFound();
  }

  // We are in vip route
  return <FirmTrackClient firm={firm} basePath={`/vip/${params.slug}`} />;
}
