import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FirmLandingClient } from "./FirmLandingClient";

export default async function FirmLandingPage({ params }: { params: { slug: string } }) {
  // Try to find the firm by domain (slug)
  const firm = await prisma.firm.findFirst({
    where: {
      domain: params.slug,
      isActive: true,
    },
    select: {
      name: true,
      phone: true,
      address: true,
      domain: true,
    }
  });

  if (!firm) {
    notFound();
  }

  return <FirmLandingClient firm={firm} basePath={`/vip/${params.slug}`} />;
}
