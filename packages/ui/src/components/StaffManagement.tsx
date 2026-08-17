"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Shield, User } from "lucide-react";
import toast from "react-hot-toast";

type Staff = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
  userCode: string | null;
  createdAt: string;
};

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });

  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("E-posta ve şifre zorunludur.");
      return;
    }
    
    if (staffList.length >= 5) {
      toast.error("En fazla 5 personel ekleyebilirsiniz.");
      return;
    }

    const toastId = toast.loading("Personel ekleniyor...");
    setAdding(true);
    
    try {
      const res = await fetch("/api/auth/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Personel başarıyla eklendi!", { id: toastId });
        setForm({ firstName: "", lastName: "", email: "", username: "", password: "" });
        fetchStaff();
      } else {
        throw new Error(data.error || "Eklenemedi");
      }
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    
    const toastId = toast.loading("Personel siliniyor...");
    try {
      const res = await fetch(`/api/auth/staff/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Personel silindi!", { id: toastId });
        fetchStaff();
      } else {
        throw new Error(data.error || "Silinemedi");
      }
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    }
  };

  const startEdit = (staff: Staff) => {
    setEditingStaffId(staff.id);
    setEditForm({
      firstName: staff.firstName || "",
      lastName: staff.lastName || "",
      email: staff.email || "",
      username: staff.username || "",
    });
  };

  const handleEditSave = async (id: string) => {
    if (!editForm.email) {
      toast.error("E-posta zorunludur.");
      return;
    }
    
    const toastId = toast.loading("Personel güncelleniyor...");
    setSavingEdit(true);
    
    try {
      const res = await fetch(`/api/auth/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Personel güncellendi!", { id: toastId });
        setEditingStaffId(null);
        fetchStaff();
      } else {
        throw new Error(data.error || "Güncellenemedi");
      }
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto w-full">
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Personel / Kullanıcı Yönetimi
        </h3>
        
        <div className="bg-surface/30 border border-border-color p-6 rounded-2xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Sisteme giriş yapabilecek ek personeller ekleyebilirsiniz. <strong className="text-foreground">Sınır: {staffList.length} / 5</strong></p>
          </div>

          {/* Ekleme Formu */}
          {staffList.length < 5 ? (
            <form onSubmit={handleAdd} className="bg-background border border-border-color p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase">Yeni Personel Ekle</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Ad</label>
                  <input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Soyad</label>
                  <input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">E-posta *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Kullanıcı Adı</label>
                  <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Şifre *</label>
                  <input type="text" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-surface border border-border-color rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Personel için bir şifre belirleyin" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={adding} className="bg-primary text-white font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Ekle
                </button>
              </div>
            </form>
          ) : (
             <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
               <p className="text-sm font-semibold text-amber-600 dark:text-amber-500">Maksimum personel sınırına (5) ulaştınız.</p>
             </div>
          )}

          {/* Liste */}
          <div className="space-y-3 pt-4 border-t border-border-color">
            <h4 className="text-xs font-bold text-foreground uppercase">Mevcut Personeller</h4>
            
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : staffList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Henüz hiç personel eklenmemiş.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {staffList.map(staff => (
                  <div key={staff.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background border border-border-color rounded-xl gap-4">
                    {editingStaffId === staff.id ? (
                      <div className="flex-1 w-full bg-slate-50 dark:bg-surface-light p-4 rounded-xl border border-border-color space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase">Personel Kodu:</span>
                          <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider">#{staff.userCode || "----"}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Ad</label>
                            <input type="text" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} placeholder="Ad" className="w-full bg-background border border-border-color rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Soyad</label>
                            <input type="text" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} placeholder="Soyad" className="w-full bg-background border border-border-color rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">E-Posta</label>
                            <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="E-posta" className="w-full bg-background border border-border-color rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Kullanıcı Adı (Opsiyonel)</label>
                            <input type="text" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} placeholder="Kullanıcı Adı" className="w-full bg-background border border-border-color rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {staff.firstName} {staff.lastName}
                            {staff.userCode && <span className="ml-2 text-xs bg-surface border border-border-color px-1.5 py-0.5 rounded text-muted-foreground font-mono">#{staff.userCode}</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{staff.email} {staff.username ? ` • @${staff.username}` : ''}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {editingStaffId === staff.id ? (
                        <>
                          <button onClick={() => setEditingStaffId(null)} className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors border border-border-color rounded-lg">İptal</button>
                          <button onClick={() => handleEditSave(staff.id)} disabled={savingEdit} className="px-3 py-1.5 text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg flex items-center gap-1">
                            {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : "Kaydet"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(staff)} className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg">Düzenle</button>
                          <button onClick={() => handleDelete(staff.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Sil"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
