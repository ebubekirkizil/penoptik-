import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/penoptik_db?schema=public";
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

const SEED_TEMPLATES = [
  {
    name: "Sipariş Alındı - SMS",
    type: "SMS" as const,
    content: "Sayın {MusteriAdi}, siparişiniz alınmıştır. Hazır olduğunda sizi bilgilendireceğiz. Teşekkürler.",
    subject: null,
  },
  {
    name: "Sipariş Hazır - SMS",
    type: "SMS" as const,
    content: "Sayın {MusteriAdi}, siparişiniz hazır! Mağazamızdan teslim alabilirsiniz. Bilgi: {Telefon}",
    subject: null,
  },
  {
    name: "Sipariş Hazır - WhatsApp",
    type: "WHATSAPP" as const,
    content: "Merhaba {MusteriAdi} 🎉 Siparişiniz hazır ve teslim için bekliyor. Görüşmek üzere! 👓",
    subject: null,
  },
  {
    name: "Randevu Hatırlatma - Email",
    type: "EMAIL" as const,
    subject: "Randevu Hatırlatması - Penoptik",
    content: "Sayın {MusteriAdi},\n\nYarınki randevunuzu hatırlatmak istedik. Sizi görmekten memnuniyet duyacağız.\n\nSaygılarımızla,\nPenoptik Ekibi",
  },
  {
    name: "Doğum Günü Kutlaması - SMS",
    type: "SMS" as const,
    content: "Sayın {MusteriAdi}, doğum gününüzü kutlar, sağlıklı ve mutlu yıllar dileriz! 🎂 - Penoptik",
    subject: null,
  },
];

async function main() {
  console.log('Start seeding message templates...')

  const firms = await prisma.firm.findMany()
  
  if (firms.length === 0) {
    console.log('No firms found in database. Skipping message templates seeding.')
    return
  }

  let createdCount = 0

  for (const firm of firms) {
    const existingTemplatesCount = await prisma.messageTemplate.count({
      where: { firmId: firm.id }
    })

    if (existingTemplatesCount === 0) {
      await prisma.messageTemplate.createMany({
        data: SEED_TEMPLATES.map(t => ({
          ...t,
          firmId: firm.id,
          isActive: true
        }))
      })
      createdCount += SEED_TEMPLATES.length
      console.log(`Created ${SEED_TEMPLATES.length} templates for firm ${firm.name}`)
    } else {
      console.log(`Firm ${firm.name} already has templates. Skipping.`)
    }
  }

  console.log(`Seeding finished. Added ${createdCount} templates total.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
