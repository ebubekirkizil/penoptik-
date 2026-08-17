import sys
import re

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Kritik Seviyedeki Stoklar styling
old_critical_styling = """      <div className="card overflow-hidden">
        <div className="bg-amber-50/50 dark:bg-amber-500/5 px-5 py-3 border-b border-amber-100 dark:border-amber-900/30">
          <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">Kritik Seviyedeki Stoklar</h4>
        </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">"""

new_critical_styling = """      <div className="card overflow-hidden border border-amber-500/20 shadow-lg shadow-amber-500/5">
        <div className="bg-amber-50 dark:bg-amber-500/10 px-5 py-3 border-b border-amber-100 dark:border-amber-500/20 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">Kritik Seviyedeki Stoklar</h4>
        </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-amber-50/50 dark:bg-amber-500/5 border-b border-amber-100 dark:border-amber-500/10">"""

content = content.replace(old_critical_styling, new_critical_styling)

old_tr_class = """<tr key={p.id} onClick={() => { setSelectedProduct(p); setShowDetailModal(true); }} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">"""
new_tr_class = """<tr key={p.id} onClick={() => { setSelectedProduct(p); setShowDetailModal(true); }} className="hover:bg-amber-50/50 dark:bg-slate-800/50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer group">"""

content = content.replace(old_tr_class, new_tr_class)

# 2. Fix DetailModal crashes
old_detail_1 = """    const cat = categories[p.category] || { label: p.category, bg: "#888", text: "#fff" };
    const pMovements = movements.filter(m => m.productId === p.id);
    const kdvPrice = p.salePrice * (1 + (p.kdv||20)/100);
    const netProfit = (p.salePrice || 0) - (p.costPrice || 0);"""

new_detail_1 = """    const cat = (categories && categories[p.category]) || { label: p.category || "", bg: "#888", text: "#fff" };
    const pMovements = movements?.filter(m => m.productId === p.id) || [];
    const kdvPrice = (p.salePrice || 0) * (1 + (p.kdv||20)/100);
    const netProfit = (p.salePrice || 0) - (p.costPrice || 0);"""

content = content.replace(old_detail_1, new_detail_1)

old_detail_2 = """<p className="text-2xl font-black text-emerald-600">{p.salePrice.toLocaleString("tr-TR")} ₺</p>"""
new_detail_2 = """<p className="text-2xl font-black text-emerald-600">{Number(p.salePrice || 0).toLocaleString("tr-TR")} ₺</p>"""
content = content.replace(old_detail_2, new_detail_2)

old_detail_3 = """<p className="text-2xl font-black text-slate-700 dark:text-slate-200">{p.costPrice.toLocaleString("tr-TR")} ₺</p>"""
new_detail_3 = """<p className="text-2xl font-black text-slate-700 dark:text-slate-200">{Number(p.costPrice || 0).toLocaleString("tr-TR")} ₺</p>"""
content = content.replace(old_detail_3, new_detail_3)


old_detail_4 = """<p className="text-lg font-black text-indigo-700 dark:text-indigo-400">{kdvPrice.toLocaleString("tr-TR")} ₺</p>"""
new_detail_4 = """<p className="text-lg font-black text-indigo-700 dark:text-indigo-400">{Number(kdvPrice || 0).toLocaleString("tr-TR")} ₺</p>"""
content = content.replace(old_detail_4, new_detail_4)

old_detail_5 = """<span className="text-sm font-bold text-foreground">{p.frame.ekartman || "-"}</span>"""
new_detail_5 = """<span className="text-sm font-bold text-foreground">{p.frame?.ekartman || "-"}</span>"""
content = content.replace(old_detail_5, new_detail_5)

old_detail_6 = """<span className="text-sm font-bold text-foreground">{p.frame.materyal || "-"}</span>"""
new_detail_6 = """<span className="text-sm font-bold text-foreground">{p.frame?.materyal || "-"}</span>"""
content = content.replace(old_detail_6, new_detail_6)

old_detail_7 = """<span className="text-sm font-bold text-foreground">{p.frame.renk || "-"}</span>"""
new_detail_7 = """<span className="text-sm font-bold text-foreground">{p.frame?.renk || "-"}</span>"""
content = content.replace(old_detail_7, new_detail_7)

old_detail_8 = """<span className="text-sm font-bold text-foreground">{p.lens.design || "-"}</span>"""
new_detail_8 = """<span className="text-sm font-bold text-foreground">{p.lens?.design || "-"}</span>"""
content = content.replace(old_detail_8, new_detail_8)

old_detail_9 = """<span className="text-sm font-bold text-foreground">{p.lens.index || "-"}</span>"""
new_detail_9 = """<span className="text-sm font-bold text-foreground">{p.lens?.indeks || p.lens?.index || "-"}</span>"""
content = content.replace(old_detail_9, new_detail_9)

old_detail_10 = """<span className="text-sm font-bold text-foreground">{p.contact.sph||"-"} / {p.contact.cyl||"-"} / {p.contact.axis||"-"}</span>"""
new_detail_10 = """<span className="text-sm font-bold text-foreground">{p.contact?.sph||"-"} / {p.contact?.cyl||"-"} / {p.contact?.axis||"-"}</span>"""
content = content.replace(old_detail_10, new_detail_10)

old_detail_11 = """<span className="text-sm font-bold text-foreground">{p.contact.bc||"-"} / {p.contact.dia||"-"}</span>"""
new_detail_11 = """<span className="text-sm font-bold text-foreground">{p.contact?.bc||"-"} / {p.contact?.dia||"-"}</span>"""
content = content.replace(old_detail_11, new_detail_11)

old_detail_12 = """const reason = MOVEMENT_REASONS[m.reason];"""
new_detail_12 = """const reason = MOVEMENT_REASONS[m.reason] || { label: m.reason, icon: "" };"""
content = content.replace(old_detail_12, new_detail_12)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Changes applied!")
