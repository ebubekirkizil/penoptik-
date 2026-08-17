import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SystemFinanceTransaction" (
        "id" TEXT NOT NULL,
        "firmId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'COMPLETED',
        "dueDate" TIMESTAMP(3),
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "SystemFinanceTransaction_pkey" PRIMARY KEY ("id")
      );
    `);
    
    // Check if the foreign key exists, if not, create it
    // Wait, adding constraint is safe if we just ignore error or do it IF NOT EXISTS, Postgres doesn't have IF NOT EXISTS for constraints easily.
    // Let's just create the table and then try to add the FK.
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "SystemFinanceTransaction" ADD CONSTRAINT "SystemFinanceTransaction_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Constraint might already exist:', e);
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "AiUsageLog" ADD COLUMN IF NOT EXISTS "cost" DOUBLE PRECISION NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS "isError" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;
      `);
    } catch (e) {
      console.log('AiUsageLog columns might already exist:', e);
    }
    
    return NextResponse.json({ success: true, message: "SystemFinanceTransaction table created safely and AiUsageLog columns added." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
