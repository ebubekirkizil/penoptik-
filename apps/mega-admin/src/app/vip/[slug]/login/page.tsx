import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FirmLoginClient } from "./FirmLoginClient";

export default async function FirmLoginPage({ params }: { params: { slug: string } }) {
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

  return <FirmLoginClient firm={firm} basePath={`/vip/${params.slug}`} />;
}
