import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Logs an action performed by a user/personnel.
 * Should be called inside API routes.
 * 
 * @param action - Description of the action (e.g., "Müşteri Eklendi: Ahmet Yılmaz")
 * @param details - Optional JSON object containing before/after state or additional context
 */
export async function logAction(action: string, details?: any) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) return;

    let detailsJson = null;
    if (details) {
      try {
        detailsJson = JSON.parse(JSON.stringify(details));
      } catch (e) {
        // ignore parsing errors
      }
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: detailsJson,
      }
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}
