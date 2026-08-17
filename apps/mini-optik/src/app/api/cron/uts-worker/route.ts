import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptData } from "@/lib/encryption";

// This would be called by Vercel Cron every 5 minutes
export async function GET(req: NextRequest) {
  try {
    // 1. Fetch pending items from UtsQueue
    const pendingJobs = await prisma.utsQueue.findMany({
      where: {
        status: "PENDING",
        retryCount: { lt: 3 } // Give up after 3 tries
      },
      take: 20 // Process 20 at a time to avoid timeout
    });

    if (pendingJobs.length === 0) {
      return NextResponse.json({ message: "No pending UTS jobs" });
    }

    const processed = [];

    for (const job of pendingJobs) {
      try {
        const integration = await prisma.firmIntegration.findUnique({
          where: { firmId: job.firmId }
        });

        if (!integration || !integration.utsToken) {
          throw new Error("UTS Token missing");
        }

        const rawToken = decryptData(integration.utsToken);

        // Simulated API call to UTS REST API (TİTCK)
        // const response = await fetch("https://utsapi.saglik.gov.tr/rest/bildirim/verme", { ... });
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Randomly simulate success or failure
        const isSuccess = Math.random() > 0.1; // 90% success rate

        if (!isSuccess) {
          throw new Error("UTS Servisi geçici olarak yanıt vermiyor");
        }

        // Update queue
        await prisma.utsQueue.update({
          where: { id: job.id },
          data: { status: "SUCCESS" }
        });

        // Add to permanent log
        await prisma.utsLog.create({
          data: {
            firmId: job.firmId,
            actionType: job.actionType,
            status: "SUCCESS",
            barcode: job.barcode,
            details: `Bildirim başarılı. Token ID: ${rawToken?.substring(0, 5)}...`
          }
        });

        processed.push(job.id);
      } catch (err: any) {
        // Failed
        await prisma.utsQueue.update({
          where: { id: job.id },
          data: { 
            status: "FAILED", 
            errorMessage: err.message,
            retryCount: { increment: 1 } 
          }
        });

        await prisma.utsLog.create({
          data: {
            firmId: job.firmId,
            actionType: job.actionType,
            status: "FAILED",
            barcode: job.barcode,
            details: err.message
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processedCount: processed.length,
      totalPending: pendingJobs.length 
    });

  } catch (error) {
    console.error("UTS Worker error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
