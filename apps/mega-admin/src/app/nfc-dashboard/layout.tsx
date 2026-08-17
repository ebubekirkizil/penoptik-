import Link from "next/link";
import { LayoutDashboard, CreditCard, Settings, LogOut, SmartphoneNfc } from "lucide-react";

export default function NfcDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <SmartphoneNfc size={18} />
          </div>
          <span className="font-bold text-gray-900 text-lg">NFC Yönetimi</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/nfc-dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium">
            <LayoutDashboard size={18} />
            <span>Genel Bakıx</span>
          </Link>
          <Link href="/nfc-dashboard/cards" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <CreditCard size={18} />
            <span>Kartlarım</span>
          </Link>
          <Link href="/nfc-dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Settings size={18} />
            <span>Profil Ayarları</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={18} />
            <span>Çıkıx Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <SmartphoneNfc className="text-blue-600" size={24} />
            <span className="font-bold text-gray-900">NFC Yönetimi</span>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
