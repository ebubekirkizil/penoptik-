// @ts-nocheck
import SettingsForm from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Sistem Ayarları</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Yetkiler, tema modları ve görünüm renklerini kixisellextirin.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
