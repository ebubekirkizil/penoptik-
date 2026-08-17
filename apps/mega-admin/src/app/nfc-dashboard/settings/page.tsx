import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";

export default async function NfcSettingsPage() {
  const session = await getSession();

  if (!session || !session.id) {
    redirect("/login");
  }

  // Kullanıcının profilini bul
  const profile = await db.nfcProfile.findUnique({
    where: { userId: session.id }
  });

  if (!profile) {
    return (
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil Ayarları</h1>
          <p className="text-gray-500 mt-2">Henüz bir NFC profiliniz bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profil Ayarları</h1>
        <p className="text-gray-500 mt-2">NFC profilinizin güvenliğini ve genel ayarlarını yönetin.</p>
      </div>

      <SettingsClient 
        profileId={profile.id}
        initialIsPinActive={profile.isPinActive}
        initialPinCode={profile.pinCode || ""}
      />
    </div>
  );
}
