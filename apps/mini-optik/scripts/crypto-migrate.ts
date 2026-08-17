import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Ensure this matches your encryption.ts
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'Xq9!Lm4#Yz1$Kv2*Mw8@En3%Tb7&Rc5+';
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

function hashForIndex(text: string): string {
  if (!text) return text;
  return crypto.createHmac("sha256", ENCRYPTION_KEY).update(text).digest("hex");
}

const prisma = new PrismaClient();

async function migrate() {
  console.log("KVKK Crypto Migration Started...");
  const customers = await prisma.customer.findMany();
  console.log(`Found ${customers.length} customers.`);

  for (const customer of customers) {
    if (!customer.phone) continue;
    
    // Check if it's already encrypted by checking if it contains two colons (iv:encrypted:tag)
    const isEncrypted = customer.phone.includes(':') && customer.phone.split(':').length === 3;
    
    if (isEncrypted) {
      console.log(`Customer ${customer.id} already encrypted.`);
      continue;
    }

    const phoneHash = hashForIndex(customer.phone);
    const encryptedPhone = encrypt(customer.phone);
    
    let tcNoHash = null;
    let encryptedTcNo = customer.tcNo;
    if (customer.tcNo && !customer.tcNo.includes(':')) {
      tcNoHash = hashForIndex(customer.tcNo);
      encryptedTcNo = encrypt(customer.tcNo);
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        phone: encryptedPhone,
        phoneHash: phoneHash,
        tcNo: encryptedTcNo,
        tcNoHash: tcNoHash,
      },
    });

    console.log(`Migrated customer ${customer.id}`);
  }

  console.log("Migration Complete.");
  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
});
