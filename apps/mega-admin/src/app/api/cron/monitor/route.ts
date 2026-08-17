// @ts-nocheck
import { NextResponse } from 'next/server';

import { resend } from '../../../../lib/resend';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Cron güvenliği: Sadece Vercel Cron yetkisi olan veya doğru secret'ı sağlayan istekleri kabul et
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const issues: string[] = [];
  
  // Varsayılan kritik sayfalar
  const urlsToCheck = [
    'https://penoptik.store/login',
    'https://sentientwire.com/super-admin/login',
    'https://penoptik.store/api/system/version',
  ];

  try {
    // Veritabanındaki tüm aktif firmaların domainlerini çekip listeye ekle
    const activeFirms = await prisma.firm.findMany({
      where: { isActive: true, domain: { not: null } }
    });
    
    activeFirms.forEach(firm => {
      if (firm.domain && firm.domain.length > 3) {
        const domainUrl = firm.domain.includes('http') ? firm.domain : `https://${firm.domain}`;
        if (!urlsToCheck.some(u => u.includes(firm.domain!))) {
          urlsToCheck.push(`${domainUrl}/login`);
          urlsToCheck.push(`${domainUrl}/api/system/version`);
        }
      }
    });

    // Her URL için sağlık kontrolü yap
    for (const url of urlsToCheck) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 saniye zaman axımı
        
        const response = await fetch(url, { 
          method: 'GET',
          signal: controller.signal 
        });
        
        clearTimeout(timeout);

        if (!response.ok) {
          // 404, 500 gibi hatalı HTTP kodları
          issues.push(`🚨 HATA: ${url} -> Status: ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        // Fetch tamamen çökerse (örn. DNS hatası, timeout)
        issues.push(`🔴 ULAŞILAMIYOR: ${url} -> Hata: ${error.message}`);
      }
    }

    if (issues.length > 0) {
      // Hata varsa ebukizil@gmail.com adresine Resend ile anında mail gönder
      await resend.emails.send({
        from: 'System Monitor <onboarding@resend.dev>', // Kendi domaininiz varsa örn: alerts@sentientwire.com yapılmalı
        to: 'ebukizil@gmail.com',
        subject: `⚠️ SİSTEM ÇÖKME UYARISI: ${issues.length} Hata Tespit Edildi!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">🚨 Sistem Monitörü Hata Raporu</h2>
            <p>Bazı sistemlerinizde xu an çökme veya ulaxılamama sorunları tespit edildi. Bu durum kullanıcıların platforma girixini engelliyor olabilir:</p>
            <ul style="background: #fef2f2; padding: 20px; border-radius: 8px; color: #991b1b;">
              ${issues.map(issue => `<li style="margin-bottom: 10px;"><strong>${issue}</strong></li>`).join('')}
            </ul>
            <p style="font-weight: bold;">Lütfen acilen sisteme müdahale ediniz.</p>
            <hr style="border: 1px solid #eee; margin-top: 30px;" />
            <p style="color: #666; font-size: 12px;">Otomatik Hata Algılama Sistemi (The Brain) tarafından gönderildi.</p>
          </div>
        `
      });
      return NextResponse.json({ success: true, alerted: true, issues });
    }

    return NextResponse.json({ success: true, alerted: false, message: 'Tüm sistemler aktif ve sağlıklı çalıxıyor.' });
  } catch (err: any) {
    console.error("Monitor error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
