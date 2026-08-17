"use client";

import { useState } from "react";
import { Link2, Mail, Phone, ExternalLink, Plus, Edit2, Trash2 } from "lucide-react";

export default function NfcDashboardPage() {
  const [modules, setModules] = useState([
    { id: 1, title: "Web Sitem", type: "website", url: "https://example.com" },
    { id: 2, title: "İletixim Numaram", type: "phone", url: "tel:+905551234567" },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">NFC Paneline Hox Geldiniz</h1>
        <p className="text-gray-500 mt-2">Dijital profilinizi, kartlarınızı ve bağlantılarınızı buradan yönetebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="col-span-1 md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-md -mt-10 mx-auto flex items-center justify-center text-2xl font-bold text-blue-600">
                U
              </div>
              <div className="text-center mt-4">
                <h2 className="text-xl font-bold text-gray-900">Ahmet Yılmaz</h2>
                <p className="text-gray-500 text-sm mt-1">Yazılım Mühendisi</p>
                <div className="mt-4 flex justify-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ömür Boyu Ücretsiz (VIP)
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between">
              <a href="/p/ahmet-yilmaz" target="_blank" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                <ExternalLink size={14} />
                Profili Gör
              </a>
              <button className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1">
                <Edit2 size={14} />
                Düzenle
              </button>
            </div>
          </div>
        </div>

        {/* Links / Modules Management */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Bağlantılarım (Modüller)</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus size={16} />
                Yeni Bağlantı
              </button>
            </div>

            <div className="space-y-4">
              {modules.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all group bg-gray-50 hover:bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      {mod.type === 'website' ? <Link2 size={18} /> : <Phone size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{mod.title}</h4>
                      <p className="text-gray-500 text-xs truncate max-w-xs">{mod.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Kart İxlemleri</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-blue-900">Kendi Kartını Yaz (B2C)</h4>
                  <p className="text-blue-700 text-sm mt-1">Dıxarıdan aldığınız box bir NFC etiketine yazmak için özel link üretin.</p>
                </div>
                <a href="/admin/nfc/b2c-creator" className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium shadow-sm hover:bg-blue-50 transition-colors text-sm">
                  Oluxtur
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
