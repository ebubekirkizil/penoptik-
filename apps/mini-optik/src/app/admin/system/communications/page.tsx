import CommunicationsClient from "./CommunicationsClient";

export const metadata = {
  title: "İletişim & Otomasyon | Penoptik",
};

export default function CommunicationsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">İletişim & Otomasyon</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Müşterilerinize SMS, WhatsApp ve E-posta gönderin. Otomatik mesajlaşma kurallarını yönetin.
        </p>
      </div>

      <CommunicationsClient />
    </div>
  );
}
