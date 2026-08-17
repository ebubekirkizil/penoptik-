import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientPage from "./ClientPage";

export default async function FirmPage({ params }: { params: { firmSlug: string } }) {
  // Find the firm by domain (which acts as the slug in our system)
  const firm = await prisma.firm.findFirst({
    where: {
      domain: params.firmSlug
    },
    include: {
      settings: true
    }
  });

  if (!firm) {
    return notFound();
  }

  // Parse themeData for policies and map url
  let themeData: any = {};
  if (firm.settings?.themeData) {
    try {
      themeData = JSON.parse(firm.settings.themeData);
    } catch (e) {
      console.error("Failed to parse themeData", e);
    }
  }

  // Pass necessary firm data to the Client Page
  const firmData = {
    name: firm.name,
    phone: firm.phone || "",
    address: firm.address || "",
    googleMapsUrl: themeData.googleMapsUrl || "",
    policies: themeData.policies || ""
  };

  return <ClientPage firm={firmData} />;
}
