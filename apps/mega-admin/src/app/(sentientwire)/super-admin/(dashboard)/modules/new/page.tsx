import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default function NewModulePage() {
  async function createModule(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const icon = formData.get("icon") as string;
    const color = formData.get("color") as string;
    const monthlyPrice = parseFloat(formData.get("monthlyPrice") as string || "0");
    const annualPrice = parseFloat(formData.get("annualPrice") as string || "0");
    const isCore = formData.get("isCore") === "on";

    await (prisma as any).module.create({
      data: {
        name,
        description,
        category,
        icon: icon && color ? `${icon}:${color}` : null,
        monthlyPrice,
        annualPrice,
        isCore,
        status: "Aktif"
      }
    });

    revalidatePath("/super-admin/features");
    redirect("/super-admin/features");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/features" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yeni Modül (Lego) Ekle</h1>
          <p className="text-slate-500">Sisteme yeni bir eklenti veya özellik paketi tanımlayın.</p>
        </div>
      </div>

      <form action={createModule} className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Modül Adı</label>
            <input name="name" required className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="Örn: Gelixmix Stok Takibi" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Açıklama</label>
            <textarea name="description" rows={3} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="Modülün ne ixe yaradığını kısaca açıklayın..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kategori</label>
            <select name="category" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent">
              <option value="ERP">Kurumsal Yönetim (ERP)</option>
              <option value="E-COMMERCE">E-Ticaret</option>
              <option value="CORE">Çekirdek Modül</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">İkon Adı (Lucide)</label>
            <input name="icon" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="Örn: Box, Users, Store" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Renk Teması</label>
            <select name="color" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent">
              <option value="indigo">Indigo (Mavi/Mor)</option>
              <option value="emerald">Emerald (Yexil)</option>
              <option value="rose">Rose (Kırmızı)</option>
              <option value="amber">Amber (Sarı/Turuncu)</option>
              <option value="pink">Pink (Pembe)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aylık Fiyat (TL)</label>
            <input name="monthlyPrice" type="number" step="0.01" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="0.00" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Yıllık Fiyat (TL)</label>
            <input name="annualPrice" type="number" step="0.01" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="0.00" />
          </div>

          <div className="space-y-2 md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <input type="checkbox" name="isCore" id="isCore" className="w-5 h-5 rounded border-slate-300" />
            <label htmlFor="isCore" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bu bir çekirdek (zorunlu) modül mü?</label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Save className="w-5 h-5" /> Kaydet ve Oluxtur
          </button>
        </div>
      </form>
    </div>
  );
}
