const fs = require('fs');
const filePath = 'c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx';
const txt = fs.readFileSync(filePath, 'utf8');
const lines = txt.split('\n').slice(0, 1257);
const bottom = `
    const handleAdd = () => {
      if(!newCatLabel) return;
      const key = newCatLabel.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      setLocalCats(prev => ({
        ...prev,
        [key]: { label: newCatLabel, bg: "#4f818c", text: "#ffffff" }
      }));
      setNewCatLabel("");
    };

    const handleRemove = (k: string) => {
      const copy = { ...localCats };
      delete copy[k];
      setLocalCats(copy);
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setShowSettingsModal(false)}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-surface rounded-3xl shadow-2xl border border-[var(--border-color)] w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <h2 className="text-lg font-black text-foreground">Ayarlar</h2>
            <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Kategoriler</h3>
              <div className="space-y-2 mb-4">
                {Object.keys(localCats).map(k => (
                  <div key={k} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-background">
                    <input value={localCats[k].label} onChange={e => setLocalCats(prev => ({...prev, [k]: {...prev[k], label: e.target.value}}))} className="flex-1 bg-transparent px-2 py-1 text-sm font-bold outline-none" />
                    <input type="color" value={localCats[k].bg} onChange={e => setLocalCats(prev => ({...prev, [k]: {...prev[k], bg: e.target.value}}))} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                    <input type="color" value={localCats[k].text} onChange={e => setLocalCats(prev => ({...prev, [k]: {...prev[k], text: e.target.value}}))} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                    <button onClick={() => handleRemove(k)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} placeholder="Yeni Kategori Adı" className="flex-1 px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" />
                <button onClick={handleAdd} className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">Ekle</button>
              </div>
            </div>
          </div>
          <div className="p-5 border-t border-[var(--border-color)] bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
            <button onClick={() => setShowSettingsModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">İptal</button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all">Kaydet</button>
          </div>
        </div>
      </div>
    );
  };

  const DetailModal = () => {
    const [optikAcik, setOptikAcik] = useState(false);
    if(!selectedProduct) return null;
    const p = selectedProduct;
    const cat = categories[p.category] || { label: p.category, bg: "#888", text: "#fff" };
    const pMovements = movements.filter(m => m.productId === p.id);
    const kdvPrice = p.salePrice * (1 + (p.kdv||20)/100);
    const netProfit = (p.salePrice || 0) - (p.costPrice || 0);

    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-surface rounded-3xl shadow-2xl border border-[var(--border-color)] w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">{p.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{p.brand} &bull; Barkod: {p.barcode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowDetailModal(false); handleEditProduct(p); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><Edit2 className="w-4 h-4" /> Düzenle</button>
              <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Stat Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">MEVCUT STOK</p>
                <p className="text-2xl font-black text-foreground">{p.stock} <span className="text-sm font-medium text-muted-foreground">Adet</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">SATIŞ FİYATI</p>
                <p className="text-2xl font-black text-emerald-600">{p.salePrice.toLocaleString("tr-TR")}  </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">MALİYET</p>
                <p className="text-2xl font-black text-slate-700 dark:text-slate-200">{p.costPrice.toLocaleString("tr-TR")}  </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">KATEGORİ</p>
                <p className="text-lg font-black" style={{ color: cat.bg }}>{cat.label}</p>
              </div>
            </div>

            {/* Finans & Kar Detayları */}
            <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2"><Receipt className="w-4 h-4" /> Finansal Analiz</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">Net Kar (KDV Hariç)</p>
                  <p className={\`text-lg font-black \${netProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}\`}>{netProfit > 0 ? '+' : ''}{netProfit.toLocaleString("tr-TR")}  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">Kar Oranı</p>
                  <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">%{(p.costPrice > 0 ? Math.round(netProfit/p.costPrice*100) : 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">KDV Oranı</p>
                  <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">%{p.kdv || 20}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">KDV'li Satıx Fiyatı</p>
                  <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">{kdvPrice.toLocaleString("tr-TR")}  </p>
                </div>
              </div>
            </div>

            {/* Optik Detayları (Açılır/Kapanır) */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <button onClick={() => setOptikAcik(!optikAcik)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Ürün (Optik) Detayları</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{optikAcik ? 'Gizle' : 'Göster'}</span>
                  <div className={\`w-10 h-6 rounded-full p-1 transition-colors \${optikAcik ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}\`}>
                    <div className={\`w-4 h-4 bg-white rounded-full shadow-sm transition-transform \${optikAcik ? 'translate-x-4' : 'translate-x-0'}\`} />
                  </div>
                </div>
              </button>
              
              <div className={\`transition-all duration-300 ease-in-out \${optikAcik ? 'max-h-96 border-t border-slate-200 dark:border-slate-700' : 'max-h-0'}\`}>
                <div className="p-4 space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
                  {p.frame && (
                    <>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">Ekartman</span>
                        <span className="text-sm font-bold text-foreground">{p.frame.ekartman || "-"}</span>
                      </div>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">Materyal</span>
                        <span className="text-sm font-bold text-foreground">{p.frame.materyal || "-"}</span>
                      </div>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">Renk</span>
                        <span className="text-sm font-bold text-foreground">{p.frame.renk || "-"}</span>
                      </div>
                    </>
                  )}
                  {p.lens && (
                    <>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">Tasarım</span>
                        <span className="text-sm font-bold text-foreground">{p.lens.design || "-"}</span>
                      </div>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">İndeks</span>
                        <span className="text-sm font-bold text-foreground">{p.lens.index || "-"}</span>
                      </div>
                    </>
                  )}
                  {p.contact && (
                    <>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">SPH / CYL / AXIS</span>
                        <span className="text-sm font-bold text-foreground">{p.contact.sph||"-"} / {p.contact.cyl||"-"} / {p.contact.axis||"-"}</span>
                      </div>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">BC / DIA</span>
                        <span className="text-sm font-bold text-foreground">{p.contact.bc||"-"} / {p.contact.dia||"-"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Ekstra Detaylar & Notlar */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2"><List className="w-4 h-4 text-primary" /> Sistem Bilgileri & Notlar</h3>
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kritik Stok Uyarı Değeri</span>
                  <span className="text-sm font-bold text-amber-600">{p.criticalLimit} Adet</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tedarikçi Firma</span>
                  <span className="text-sm font-bold text-foreground">{getSupplierName(p.supplierId) || "Belirtilmemix"}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ürün Notu</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{p.notes || "Herhangi bir not eklenmemix."}</p>
                </div>
              </div>
            </div>

            {/* Stok Hareket Geçmixi */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2"><ArrowUpDown className="w-4 h-4 text-primary" /> Stok Hareket Geçmixi</h3>
              <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tarih</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">İxlem</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Adet</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Personel</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Not</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                    {pMovements.length > 0 ? pMovements.map(m => {
                       const isIn = m.type === "GIRIS";
                       const reason = MOVEMENT_REASONS[m.reason];
                       return (
                        <tr key={m.id} className="hover:bg-slate-50 dark:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-medium">{m.date}</td>
                          <td className="px-4 py-3"><span className={\`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border \${isIn ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600"}\`}>{reason.label}</span></td>
                          <td className={\`px-4 py-3 font-black \${isIn ? "text-emerald-600" : "text-rose-600"}\`}>{isIn ? "+" : "-"}{m.quantity}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{m.staff}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{m.note || "—"}</td>
                        </tr>
                       )
                    }) : (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Bu ürüne ait stok hareketi bulunmuyor.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-primary" /> Stok Takibi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mağaza envanteri, kategori bazlı ürünler, tedarikçiler ve stok hareketleri
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Barkod, Ürün Adı, Marka Ara..."
                   className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>
          <button onClick={() => setShowSettingsModal(true)} className="w-10 h-10 rounded-xl bg-surface border border-[var(--border-color)] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/50 transition-all"><Settings className="w-4 h-4" /></button>
        </div>
      </div>

      {!activeSupplierId && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Toplam SKU", value: products.length, icon: Package, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/50", type: "ALL" },
            { label: "Kritik Stok", value: products.filter(p => p.stock <= p.criticalLimit).length, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/50", type: "CRITICAL" },
            { label: "Tükenenler", value: products.filter(p => p.stock === 0).length, icon: X, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/50", type: "EMPTY" },
            { label: "Aktif Tedarikçi", value: suppliers.length, icon: Truck, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/50", type: "SUPPLIERS" },
          ].map((stat, i) => (
            <div key={i} onClick={() => { if(stat.type === "CRITICAL" || stat.type === "EMPTY") { setActiveTab("CRITICAL"); } else if(stat.type === "SUPPLIERS") { setActiveTab("SUPPLIERS"); } else { setActiveTab("INVENTORY"); setFilterCategory("ALL"); } }} 
                 className="card p-5 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${stat.bg} \${stat.color} group-hover:scale-110 transition-transform\`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "INVENTORY" && renderInventory()}
      {activeTab === "CRITICAL" && renderCritical()}
      {activeTab === "MOVEMENTS" && renderMovements()}
      {activeTab === "SUPPLIERS" && renderSuppliers()}

      {showAddModal && <ProductModal />}
      {showMovementModal && <MovementModal />}
      {showSupplierModal && <SupplierModal />}
      {showSettingsModal && <SettingsModal />}
      {showDetailModal && <DetailModal />}
    </div>
  );
}
`;
fs.writeFileSync(filePath, lines.join('\n') + '\n' + bottom);
