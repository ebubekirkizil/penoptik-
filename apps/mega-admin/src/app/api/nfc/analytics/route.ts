import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// In Next.js, we can read user agent from the headers easily
// We can use a lightweight approach to parse it or just store the raw string

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileId, cardId, actionType, targetId } = body;
    
    // IP Address fetching (depends on deployment, x-forwarded-for works on Vercel)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Hash IP for GDPR / KVKK compliance
    const salt = process.env.ANALYTICS_SALT || 'impecta-nfc-secret-salt';
    const ipHash = crypto.createHash('sha256').update(ip + salt).digest('hex');

    // Parse simple user agent
    const userAgentString = req.headers.get('user-agent') || '';
    let os = 'Unknown';
    if (userAgentString.includes('iPhone') || userAgentString.includes('iPad')) os = 'iOS';
    else if (userAgentString.includes('Android')) os = 'Android';
    else if (userAgentString.includes('Windows')) os = 'Windows';
    else if (userAgentString.includes('Mac OS')) os = 'MacOS';

    let deviceType = 'desktop';
    if (userAgentString.includes('Mobile') || userAgentString.includes('Android') || userAgentString.includes('iPhone')) {
      deviceType = 'mobile';
    }

    // Check if this IP has visited this profile today for 'page_view'
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let isUnique = true;
    if (actionType === 'page_view') {
      const existingVisit = await db.nfcAnalytics.findFirst({
        where: { 
          profileId, 
          ipHash, 
          scanDate: { gte: today }, 
          actionType: 'page_view' 
        }
      });
      if (existingVisit) {
        isUnique = false;
      }
    } else {
      // For link clicks, uniqueness is usually tracked per session/day as well
      const existingClick = await db.nfcAnalytics.findFirst({
        where: {
          profileId,
          ipHash,
          targetId,
          scanDate: { gte: today },
          actionType
        }
      });
      if (existingClick) {
        isUnique = false;
      }
    }

    // Record Analytics
    await db.nfcAnalytics.create({
      data: {
        profileId,
        cardId: cardId || null,
        actionType, // "page_view", "link_click", "vcard_download"
        targetId,
        os,
        browser: 'Unknown', // We could use a library like ua-parser-js if more detail is needed
        deviceType,
        userAgent: userAgentString.substring(0, 200), // Max 200 chars
        ipHash,
        isUnique,
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
