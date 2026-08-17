import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { profileId, name, title, bio, companyName, themeColor, profileImage, coverImage, isPinActive, pinCode, layout, slug } = await req.json();
    
    if (!profileId) {
      return NextResponse.json({ success: false, error: 'Profil ID gerekli' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (title !== undefined) dataToUpdate.title = title;
    if (bio !== undefined) dataToUpdate.bio = bio;
    if (companyName !== undefined) dataToUpdate.companyName = companyName;
    if (themeColor !== undefined) dataToUpdate.themeColor = themeColor;
    if (profileImage !== undefined) dataToUpdate.profileImage = profileImage;
    if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;
    if (isPinActive !== undefined) dataToUpdate.isPinActive = isPinActive;
    if (pinCode !== undefined) dataToUpdate.pinCode = isPinActive ? pinCode : null;
    if (layout !== undefined) dataToUpdate.layout = layout;
    
    if (slug !== undefined) {
      // Validate and sanitize slug
      const sanitizedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (sanitizedSlug.length > 0) {
        // Check uniqueness
        const existing = await db.nfcProfile.findFirst({
          where: { slug: sanitizedSlug, NOT: { id: profileId } }
        });
        if (existing) {
          return NextResponse.json({ success: false, error: 'Bu alan adı (slug) zaten kullanımda, lütfen baxka bir tane seçin.' }, { status: 400 });
        }
        dataToUpdate.slug = sanitizedSlug;
      }
    }

    const updatedProfile = await db.nfcProfile.update({
      where: { id: profileId },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
