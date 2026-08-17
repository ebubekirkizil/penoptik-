import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    if (!slug) {
      return new NextResponse("Slug Required", { status: 400 });
    }

    // Profili ve aktif modüllerini çek
    const profile = await db.nfcProfile.findUnique({ 
      where: { slug }, 
      include: { 
        modules: {
          where: { isActive: true }
        } 
      } 
    });
    
    if (!profile) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Telefon, email, adres gibi bilgileri modüllerden veya profil alanlarından bul
    const phoneModule = profile.modules.find(m => m.type === 'phone' || m.type === 'whatsapp');
    const emailModule = profile.modules.find(m => m.type === 'email');
    const websiteModule = profile.modules.find(m => m.type === 'custom' || m.type === 'company' || m.type === 'portfolio');
    
    const phone = phoneModule?.url ? phoneModule.url.replace(/[^0-9+]/g, '') : '';
    const email = emailModule?.url || '';
    const website = websiteModule?.url || `https://sentientwire.com/p/${profile.slug}`;
    
    // vCard (VCF) v3.0 formatı oluxtur
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name || 'İsimsiz'}
N:${(profile.name || 'İsimsiz').split(' ').reverse().join(';')};;;
TITLE:${profile.title || ''}
ORG:${profile.companyName || ''}
TEL;TYPE=CELL:${phone}
EMAIL;TYPE=WORK:${email}
URL:${website}
NOTE:${(profile.bio || '').replace(/\n/g, '\\n')}
END:VCARD`;

    // Dosya adı oluxtur (Özel karakterleri temizle)
    const safeName = (profile.name || 'kart').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeName}.vcf`;

    // İndirme baxlıkları (tarayıcının otomatik indirmesi / rehber popup'ı açması için)
    return new NextResponse(vcard, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("vCard Generation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
