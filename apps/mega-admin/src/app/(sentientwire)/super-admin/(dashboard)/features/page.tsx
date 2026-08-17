import Link from "next/link";
import { 
  Package, Receipt, Users, BarChart3, Settings, ShieldCheck, Box, Globe, 
  Briefcase, Landmark, UserPlus, CalendarCheck, ShoppingCart, Percent, 
  Bot, Truck, Store, Zap, Plus 
} from "lucide-react";
import { prisma } from "@/lib/prisma";

const iconMap: Record<string, any> = {
  "Box": <Box className="w-8 h-8 text-indigo-500" />,
  "Users": <Users className="w-8 h-8 text-amber-500" />,
  "Landmark": <Landmark className="w-8 h-8 text-blue-500" />,
  "UserPlus": <UserPlus className="w-8 h-8 text-emerald-500" />,
  "CalendarCheck": <CalendarCheck className="w-8 h-8 text-cyan-500" />,
  "Receipt": <Receipt className="w-8 h-8 text-emerald-600" />,
  "ShieldCheck": <ShieldCheck className="w-8 h-8 text-rose-500" />,
  "BarChart3": <BarChart3 className="w-8 h-8 text-violet-500" />,
  "Globe": <Globe className="w-8 h-8 text-sky-500" />,
  "ShoppingCart": <ShoppingCart className="w-8 h-8 text-pink-500" />,
  "Percent": <Percent className="w-8 h-8 text-orange-500" />,
  "Zap": <Zap className="w-8 h-8 text-yellow-500" />,
  "Store": <Store className="w-8 h-8 text-fuchsia-500" />,
  "Truck": <Truck className="w-8 h-8 text-teal-500" />,
  "Package": <Package className="w-8 h-8 text-indigo-500" />,
};

const colorMap: Record<string, string> = {
  "indigo": "from-indigo-500/20 to-blue-500/20",
  "amber": "from-amber-500/20 to-orange-500/20",
  "blue": "from-blue-500/20 to-indigo-500/20",
  "emerald": "from-emerald-500/20 to-teal-500/20",
  "cyan": "from-cyan-500/20 to-blue-500/20",
  "rose": "from-rose-500/20 to-red-500/20",
  "violet": "from-violet-500/20 to-purple-500/20",
  "sky": "from-sky-500/20 to-blue-500/20",
  "pink": "from-pink-500/20 to-rose-500/20",
  "orange": "from-orange-500/20 to-amber-500/20",
  "yellow": "from-yellow-500/20 to-orange-500/20",
  "fuchsia": "from-fuchsia-500/20 to-purple-500/20",
  "teal": "from-teal-500/20 to-cyan-500/20",
};

import { SAAS_MODULES } from "../../../../../lib/modules";

export default async function FeaturesPage() {
  // Use the central module registry
  const modules = SAAS_MODULES.flatMap(category => 
    category.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: category.categoryId === "CRM" || category.categoryId === "INVENTORY" || category.categoryId === "FINANCE" ? "ERP" : "E-COMMERCE",
      icon: category.categoryId === "CRM" ? "Users:sky" : category.categoryId === "INVENTORY" ? "Box:emerald" : "Receipt:amber",
      status: "Aktif"
    }))
  );

  const erpModules = modules.filter(m => m.category === "ERP" || m.category === "CORE");
  const ecommerceModules = modules.filter(m => m.category === "E-COMMERCE");

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Modüller (Legolar)</h1>
          <p className="text-slate-500 mt-2 max-w-3xl">
            Sisteme entegre edilen tüm ERP ve E-Ticaret modüllerini (Lego parçalarını) buradan yönetebilirsiniz. 
          </p>
        </div>
        <Link href="/super-admin/modules/new" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni Modül (Lego) Ekle
        </Link>
      </div>

      {/* ERP Modules Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kurumsal Yönetim (ERP) Modülleri</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Şirketinizin tüm arka plan operasyonlarını yönetin.</p>
          </div>
        </div>

        {erpModules.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Henüz bir ERP modülü eklenmemix.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {erpModules.map((feature) => {
              const iconParts = feature.icon ? feature.icon.split(':') : ['Package', 'indigo'];
              const iconName = iconParts[0] || 'Package';
              const colorName = iconParts[1] || 'indigo';

              return (
              <Link 
                key={feature.id} 
                href={`/super-admin/modules/${feature.id}`}
                className="group relative bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorMap[colorName] || colorMap['indigo']} rounded-bl-full opacity-50 transition-transform group-hover:scale-110`}></div>
                
                <div className="relative z-10">
                  <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6">
                    {iconMap[iconName] || iconMap['Package']}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${
                      feature.status === "Aktif" 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      {feature.status}
                    </span>
                    
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Düzenle &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>

      {/* E-Commerce Modules Section */}
      <div className="space-y-6 mt-12">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 rounded-lg">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">E-Ticaret Modülleri</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Son tüketiciye (B2C) satıx, pazarlama, lojistik süreçlerini yöneten modüller.</p>
          </div>
        </div>

        {ecommerceModules.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Henüz bir E-Ticaret modülü eklenmemix.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {ecommerceModules.map((feature) => {
              const iconParts = feature.icon ? feature.icon.split(':') : ['ShoppingCart', 'pink'];
              const iconName = iconParts[0] || 'ShoppingCart';
              const colorName = iconParts[1] || 'pink';

              return (
              <Link 
                key={feature.id} 
                href={`/super-admin/modules/${feature.id}`}
                className="group relative bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorMap[colorName] || colorMap['pink']} rounded-bl-full opacity-50 transition-transform group-hover:scale-110`}></div>
                
                <div className="relative z-10">
                  <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6">
                    {iconMap[iconName] || iconMap['ShoppingCart']}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${
                      feature.status === "Aktif" 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      {feature.status}
                    </span>
                    
                    <span className="text-sm font-semibold text-pink-600 dark:text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Düzenle &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>

      {/* Ready-Made Templates Section */}
      <div className="space-y-6 mt-12">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hazır Sektörel Şablonlar</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Yeni müxterilerinize anında kurabileceğiniz anahtar teslim ön tanımlı modül paketleri.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Link 
            href="/super-admin/features/templates/sample-optic"
            className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-700/50 flex items-center justify-center mb-6">
                <Store className="w-8 h-8 text-emerald-500" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Optik Sektörü Şablonu</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                Bir optik mağazasının ihtiyaç duyduğu tüm reçete, stok ve müxteri takip modüllerini içeren anahtar teslim xablon.
              </p>
              
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1">
                  <Bot className="w-3 h-3" /> AI Destekli
                </span>
                
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  İncele & Yönet &rarr;
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}
