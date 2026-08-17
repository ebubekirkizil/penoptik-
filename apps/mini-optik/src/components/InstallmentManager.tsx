"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, Trash2, CheckCircle, Clock, Loader2, X, Zap, Edit2, Save, AlertCircle, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Installment = {
  id: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAt: string | null;
};

export default function InstallmentManager({ orderId, orderBalance, orderTotalPrice, initialInstallments = [] }: { orderId: string, orderBalance: number, orderTotalPrice: number | null, initialInstallments?: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update local state when initialInstallments changes from server via router.refresh
  useEffect(() => {
    setInstallments(initialInstallments);
  }, [initialInstallments]);

  // New installment form
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [autoFreq, setAutoFreq] = useState("MONTHLY");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editOverplanId, setEditOverplanId] = useState<string | null>(null);
  const [editOverplanDiff, setEditOverplanDiff] = useState<number | null>(null);

  const [fastPayAmount, setFastPayAmount] = useState("");
  const [overpayAmount, setOverpayAmount] = useState<number | null>(null);
  const [conflictAmount, setConflictAmount] = useState<number | null>(null);
  const [installmentOverpay, setInstallmentOverpay] = useState<Installment | null>(null);
  const [overplanAmount, setOverplanAmount] = useState<number | null>(null);
  const [overplanDate, setOverplanDate] = useState<string | null>(null);

  const fetchInstallments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/installments`);
      const data = await res.json();
      setInstallments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const executeAddInstallment = async (amt: number | string, dateStr: string) => {
    const toastId = toast.loading("Taksit ekleniyor...");
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/installments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, dueDate: dateStr }),
      });
      if (res.ok) {
        toast.success("Taksit başarıyla eklendi!", { id: toastId });
        setAmount("");
        setDueDate("");
        setOverplanAmount(null);
        setOverplanDate(null);
        fetchInstallments();
        router.refresh();
      } else {
        throw new Error("Taksit eklenemedi");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const executeOverplanIncrease = async (enteredAmount: number, dateStr: string) => {
    const unpaidPlanned = installments.filter(i => !i.isPaid).reduce((sum, i) => sum + i.amount, 0);
    const unplannedBalance = orderBalance - unpaidPlanned;
    const diff = enteredAmount - unplannedBalance;
    if (diff <= 0 || orderTotalPrice === null) return;
    
    const toastId = toast.loading("Satış fiyatı güncelleniyor...");
    setSaving(true);
    try {
      const newTotalPrice = orderTotalPrice + diff;
      const newBalance = orderBalance + diff;
      
      const patchRes = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice: newTotalPrice, balance: newBalance })
      });
      
      if (!patchRes.ok) throw new Error("Fiyat güncellenemedi");
      
      toast.success("Fiyat arttırıldı, taksit ekleniyor...", { id: toastId });
      
      const res = await fetch(`/api/orders/${orderId}/installments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: enteredAmount, dueDate: dateStr }),
      });
      
      if (res.ok) {
        toast.success("Taksit başarıyla eklendi!", { id: toastId });
        setAmount("");
        setDueDate("");
        setOverplanAmount(null);
        setOverplanDate(null);
        fetchInstallments();
        router.refresh();
      } else {
        throw new Error("Taksit eklenemedi");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!amount || !dueDate) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const unpaidPlanned = installments.filter(i => !i.isPaid).reduce((sum, i) => sum + i.amount, 0);
    const unplannedBalance = orderBalance - unpaidPlanned;

    if (amountNum > unplannedBalance) {
      setOverplanAmount(amountNum);
      setOverplanDate(dueDate);
      return;
    }

    executeAddInstallment(amount, dueDate);
  };

  const executeFastPay = async (amountToPay: number) => {
    const toastId = toast.loading("Hızlı ödeme alınıyor...");
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/orders/${orderId}/installments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountToPay, dueDate: today, isPaid: true }),
      });
      if (res.ok) {
        toast.success("Ödeme başarıyla alındı!", { id: toastId });
        setFastPayAmount("");
        setOverpayAmount(null);
        fetchInstallments();
        router.refresh();
      } else {
        throw new Error("Ödeme alınamadı");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const executeOverpayIncrease = async (enteredAmount: number) => {
    const diff = enteredAmount - orderBalance;
    if (diff <= 0 || orderTotalPrice === null) return;
    
    const toastId = toast.loading("Satış fiyatı güncelleniyor...");
    setSaving(true);
    try {
      // 1. Update the order total price and balance
      const newTotalPrice = orderTotalPrice + diff;
      const newBalance = orderBalance + diff;
      
      const patchRes = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice: newTotalPrice, balance: newBalance })
      });
      
      if (!patchRes.ok) throw new Error("Fiyat güncellenemedi");
      
      // 2. Now take the payment
      toast.success("Fiyat arttırıldı, ödeme alınıyor...", { id: toastId });
      await executeFastPay(enteredAmount);
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
      setSaving(false);
    }
  };

  const handleFastPay = () => {
    if (!fastPayAmount) return;
    const amount = parseFloat(fastPayAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (amount > orderBalance) {
      setOverpayAmount(amount);
      return;
    }

    const unpaidPlanned = installments.filter(i => !i.isPaid).reduce((sum, i) => sum + i.amount, 0);
    const newBalanceAfterPay = orderBalance - amount;
    
    if (unpaidPlanned > newBalanceAfterPay) {
      setConflictAmount(amount);
      return;
    }

    executeFastPay(amount);
  };

  const executeTakeAndClearUnpaid = async (amount: number) => {
    const toastId = toast.loading("Ödeme alınıyor ve bekleyen taksitler temizleniyor...");
    setSaving(true);
    try {
      const unpaid = installments.filter(i => !i.isPaid);
      for (const inst of unpaid) {
        await fetch(`/api/installments/${inst.id}`, { method: "DELETE" });
      }
      
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/orders/${orderId}/installments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, dueDate: today, isPaid: true }),
      });
      
      if (res.ok) {
        toast.success("Ödeme alındı ve plan temizlendi!", { id: toastId });
        setFastPayAmount("");
        setConflictAmount(null);
        fetchInstallments();
        router.refresh();
      } else {
        throw new Error("Ödeme alınamadı");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const executeTakeAndEqualizeUnpaid = async (amount: number) => {
    const toastId = toast.loading("Ödeme alınıyor ve taksitler güncelleniyor...");
    setSaving(true);
    try {
      const unpaid = installments.filter(i => !i.isPaid);
      if (unpaid.length > 0) {
        const newBalanceAfterPay = orderBalance - amount;
        const count = unpaid.length;
        const baseAmount = parseFloat((newBalanceAfterPay / count).toFixed(2));
        const remainder = newBalanceAfterPay - (baseAmount * count);
        
        let index = 0;
        for (const inst of unpaid) {
          let finalAmount = baseAmount;
          if (index === 0) {
            finalAmount = parseFloat((baseAmount + remainder).toFixed(2));
          }
          await fetch(`/api/installments/${inst.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: finalAmount })
          });
          index++;
        }
      }
      
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/orders/${orderId}/installments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, dueDate: today, isPaid: true }),
      });
      
      if (res.ok) {
        toast.success("Ödeme alındı ve taksitler eşitlendi!", { id: toastId });
        setFastPayAmount("");
        setConflictAmount(null);
        fetchInstallments();
        router.refresh();
      } else {
        throw new Error("Ödeme alınamadı");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleAutoGenerate = async (count: number) => {
    const freqLabel = autoFreq === "WEEKLY" ? "haftalık" : autoFreq === "BIWEEKLY" ? "15 günlük" : "aylık";
    if (!confirm(`Kalan bakiyeyi (${orderBalance} ₺) otomatik olarak ${count} taksite (${freqLabel}) bölmek istediğinize emin misiniz?`)) return;
    const toastId = toast.loading(`${count} taksit planı oluşturuluyor...`);
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/installments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoCount: count.toString(), balance: orderBalance.toString(), autoFrequency: autoFreq }),
      });
      if (res.ok) {
        toast.success("Taksit planı oluşturuldu!", { id: toastId });
        fetchInstallments();
        router.refresh();
      } else {
        throw new Error("Taksitler oluşturulamadı");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePaid = async (inst: Installment) => {
    if (!inst.isPaid && inst.amount > orderBalance) {
      setInstallmentOverpay(inst);
      return;
    }

    const msg = inst.isPaid 
      ? "Ödemeyi iptal etmek istediğinize emin misiniz? (Bakiye tekrar eklenecektir)"
      : "Alınan ödemeyi kaydetmek istiyor musunuz?";
      
    if (!confirm(msg)) return;

    const toastId = toast.loading("Durum güncelleniyor...");
    try {
      const res = await fetch(`/api/installments/${inst.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: !inst.isPaid, paidAt: !inst.isPaid ? new Date().toISOString() : null }),
      });
      if (res.ok) {
        toast.success("Durum güncellendi!", { id: toastId });
        fetchInstallments();
        router.refresh();
      } else {
        throw new Error("Güncellenemedi");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    }
  };

  const executeReduceAndPay = async (inst: Installment) => {
    const toastId = toast.loading("Taksit güncelleniyor ve tahsil ediliyor...");
    setSaving(true);
    try {
      const today = new Date().toISOString();
      const res = await fetch(`/api/installments/${inst.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: orderBalance, isPaid: true, paidAt: today }),
      });
      if (!res.ok) throw new Error("Güncellenemedi");
      toast.success("Ödeme başarıyla alındı!", { id: toastId });
      setInstallmentOverpay(null);
      fetchInstallments();
      router.refresh();
    } catch(e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const executeIncreasePriceAndPay = async (inst: Installment) => {
    const diff = inst.amount - orderBalance;
    if (diff <= 0 || orderTotalPrice === null) return;
    
    const toastId = toast.loading("Satış fiyatı artırılıyor ve ödeme alınıyor...");
    setSaving(true);
    try {
      const newTotalPrice = orderTotalPrice + diff;
      const newBalance = orderBalance + diff;
      
      const patchRes = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice: newTotalPrice, balance: newBalance })
      });
      if (!patchRes.ok) throw new Error("Fiyat güncellenemedi");

      const today = new Date().toISOString();
      const res = await fetch(`/api/installments/${inst.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: true, paidAt: today }),
      });
      if (!res.ok) throw new Error("Ödeme kaydedilemedi");

      toast.success("Fiyat artırıldı ve ödeme alındı!", { id: toastId });
      setInstallmentOverpay(null);
      fetchInstallments();
      router.refresh();
    } catch(e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu taksidi silmek istediğinize emin misiniz?")) return;
    const toastId = toast.loading("Taksit siliniyor...");
    try {
      const res = await fetch(`/api/installments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Taksit silindi!", { id: toastId });
        fetchInstallments();
        router.refresh();
      } else {
        throw new Error("Silinemedi");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    }
  };

  const startEdit = (inst: Installment) => {
    setEditingId(inst.id);
    setEditAmount(inst.amount.toString());
    // Format date for input type="date"
    const dateObj = new Date(inst.dueDate);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    setEditDate(`${yyyy}-${mm}-${dd}`);
  };

  const executeSaveEdit = async (id: string, newAmount: number, newDate: string) => {
    const toastId = toast.loading("Taksit güncelleniyor...");
    setSaving(true);
    try {
      const res = await fetch(`/api/installments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: newAmount, dueDate: new Date(newDate).toISOString() }),
      });
      if (res.ok) {
        toast.success("Taksit güncellendi!", { id: toastId });
        setEditingId(null);
        setEditOverplanId(null);
        setEditOverplanDiff(null);
        fetchInstallments();
        router.refresh();
      } else {
        throw new Error("Güncellenemedi");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editingId || !editAmount || !editDate) return;
    const amountNum = parseFloat(editAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const inst = installments.find(i => i.id === editingId);
    if (inst && !inst.isPaid) {
      const diff = amountNum - inst.amount;
      if (diff > 0) {
        const unpaidPlanned = installments.filter(i => !i.isPaid).reduce((sum, i) => sum + i.amount, 0);
        if (unpaidPlanned + diff > orderBalance) {
          setEditOverplanId(editingId);
          setEditOverplanDiff((unpaidPlanned + diff) - orderBalance);
          return;
        }
      }
    }
    
    await executeSaveEdit(editingId, amountNum, editDate);
  };

  const executeEditOverplanIncrease = async () => {
    if (!editOverplanId || !editOverplanDiff || orderTotalPrice === null) return;
    
    const toastId = toast.loading("Satış fiyatı güncelleniyor...");
    setSaving(true);
    try {
      const newTotalPrice = orderTotalPrice + editOverplanDiff;
      const newBalance = orderBalance + editOverplanDiff;
      
      const patchRes = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice: newTotalPrice, balance: newBalance })
      });
      if (!patchRes.ok) throw new Error("Fiyat güncellenemedi");

      toast.success("Fiyat arttırıldı, taksit güncelleniyor...", { id: toastId });
      await executeSaveEdit(editOverplanId, parseFloat(editAmount), editDate);
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Fiyat güncellenirken hata oluştu"), { id: toastId });
      setSaving(false);
    }
  };

  const unpaidPlanned = installments.filter(i => !i.isPaid).reduce((sum, i) => sum + i.amount, 0);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-white dark:bg-surface hover:bg-slate-50 dark:hover:bg-surface-light text-foreground hover:text-amber-500 font-semibold text-sm transition-all border border-border-color hover:border-amber-500/40 rounded-xl px-4 py-3 shadow-sm active:scale-[0.98]"
      >
        <CreditCard className="w-4 h-4 text-amber-500" /> Taksit & Ödeme Planı
      </button>
    );
  }

  return (
    <div className="bg-surface/60 rounded-xl border border-amber-500/20 p-4 space-y-4 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-foreground text-xs font-semibold flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Taksit & Ödeme Planı
        </p>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className={`flex items-center justify-between p-2 rounded-lg border ${orderBalance === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Sipariş Kalan Bakiye</p>
          <p className={`text-sm font-bold ${orderBalance === 0 ? 'text-emerald-500' : 'text-red-500'}`}>{orderBalance.toLocaleString("tr-TR")} ₺</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Bekleyen Taksitler</p>
          <p className={`text-sm font-bold ${unpaidPlanned > orderBalance ? 'text-red-500' : 'text-amber-500'}`}>
            {unpaidPlanned.toLocaleString("tr-TR")} ₺
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {installments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">Henüz bir ödeme planı oluşturulmamış.</p>
          ) : (
            installments.map(inst => (
              <div key={inst.id} className={`flex items-center justify-between p-2 rounded-lg border ${inst.isPaid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-surface border-border-color'}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleTogglePaid(inst)} className={`w-5 h-5 rounded-full flex items-center justify-center border ${inst.isPaid ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted-foreground text-transparent hover:border-primary'}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <p className={`text-sm font-bold ${inst.isPaid ? 'text-emerald-500' : 'text-foreground'}`}>{inst.amount.toLocaleString("tr-TR")} ₺</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(inst.dueDate).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!inst.isPaid && (
                    <button onClick={() => startEdit(inst)} className="text-muted-foreground hover:text-amber-500 transition-colors p-1">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(inst.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Auto Generate and Add New Installment */}
      <div className="pt-2 border-t border-border-color space-y-4">
        
        {/* Auto Generate Options */}
        {installments.length === 0 && orderBalance > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase font-black text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-amber-500" /> Otomatik Taksitlendir
              </p>
              <select 
                value={autoFreq} 
                onChange={(e) => setAutoFreq(e.target.value)} 
                className="bg-background border border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              >
                <option value="MONTHLY">Aylık Olarak</option>
                <option value="BIWEEKLY">15 Günde Bir</option>
                <option value="WEEKLY">Haftalık Olarak</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => handleAutoGenerate(num)}
                  disabled={saving}
                  className="flex-1 min-w-[70px] bg-background hover:bg-amber-500 hover:text-white hover:shadow-md hover:-translate-y-0.5 border border-amber-500/30 text-amber-600 dark:text-amber-400 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {num} Taksit
                </button>
              ))}
            </div>
            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-3 font-medium text-center">İlk taksit tarihi seçilen döneme göre otomatik ayarlanır.</p>
          </div>
        )}

        <div className="pt-4 border-t border-border-color space-y-4">
        {/* Fast Payment */}
        <div>
          <p className="text-[10px] uppercase text-emerald-500 font-bold mb-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Hızlı Ödeme Al (Bugün)
          </p>
          <div className="flex gap-2">
            <div className="flex-[3]">
              <input
                type="number" min="0" step="0.01" value={fastPayAmount} onChange={e => setFastPayAmount(e.target.value)}
                placeholder="Ödeme Tutarı (₺)"
                className="w-full bg-surface border border-emerald-500/30 rounded-lg px-3 py-1.5 text-foreground text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" && (!fastPayAmount || parseFloat(fastPayAmount) === 0)) {
                    e.preventDefault();
                    setFastPayAmount(orderBalance.toString());
                  } else if (e.key === "Enter") {
                    handleFastPay();
                  }
                }}
              />
            </div>
            <button
              onClick={handleFastPay}
              disabled={saving || !fastPayAmount}
              className="flex-[2] bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center font-semibold text-xs shadow-sm shadow-emerald-500/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ödeme Al"}
            </button>
          </div>
        </div>

        {/* Manual Plan */}
        <div>
          <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-2">Planlı Taksit Ekle (Vade)</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-[10px] text-muted-foreground mb-1 font-semibold uppercase">Tutar (₺)</label>
              <input
                type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-surface border border-border-color rounded-lg px-2 py-1.5 text-foreground text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-muted-foreground mb-1 font-semibold uppercase">Tarih</label>
              <input
                type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full bg-surface border border-border-color rounded-lg px-2 py-1.5 text-foreground text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={saving || !amount || !dueDate}
              className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 w-9 h-9"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-border-color">
            <div className="p-4 border-b border-border-color flex justify-between items-center">
              <h3 className="font-semibold text-foreground text-sm">Taksit Düzenle</h3>
              <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Tutar (₺)</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="w-full text-sm bg-white dark:bg-slate-900 border border-border-color rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Vade Tarihi</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full text-sm bg-white dark:bg-slate-900 border border-border-color rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border-color bg-slate-50 dark:bg-surface-light flex justify-end gap-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                İptal
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {conflictAmount !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border-color">
            <div className="p-4 border-b border-border-color flex justify-between items-center bg-amber-50 dark:bg-amber-500/10">
              <h3 className="font-semibold text-amber-700 dark:text-amber-500 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Planlı Taksitlerle Çakışma
              </h3>
              <button disabled={saving} onClick={() => setConflictAmount(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-sm text-foreground space-y-3">
              <p>
                Girdiğiniz <span className="font-bold">{conflictAmount.toLocaleString("tr-TR")} ₺</span> ödemeyi alırsak kalan sipariş bakiyesi <span className="font-bold">{(orderBalance - conflictAmount).toLocaleString("tr-TR")} ₺</span> olacak.
              </p>
              <p>
                Fakat şu an bekleyen <strong>{unpaidPlanned.toLocaleString("tr-TR")} ₺</strong> tutarında planlanmış taksitiniz var! Bu durum toplam tahsilatın sipariş fiyatını aşmasına sebep olur.
              </p>
              
              <div className="mt-4 space-y-2">
                {orderBalance - unpaidPlanned > 0 && (
                  <button
                    disabled={saving}
                    onClick={() => {
                      executeFastPay(orderBalance - unpaidPlanned);
                      setConflictAmount(null);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-border-color hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors flex items-start gap-3"
                  >
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Boştaki Bakiyeyi Al ({(orderBalance - unpaidPlanned).toLocaleString("tr-TR")} ₺)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Sadece henüz planlanmamış boştaki bakiye kadarını tahsil et.</p>
                    </div>
                  </button>
                )}

                <button
                  disabled={saving}
                  onClick={() => executeTakeAndClearUnpaid(conflictAmount)}
                  className="w-full text-left p-3 rounded-xl border border-border-color hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Ödemeyi Al ve Planı Temizle</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{conflictAmount.toLocaleString("tr-TR")} ₺ tahsil et, tüm bekleyen taksitleri iptal et. (Kalan bakiye için yeniden plan yapabilirsiniz)</p>
                  </div>
                </button>

                {installments.filter(i => !i.isPaid).length > 0 && orderBalance - conflictAmount > 0 && (
                  <button
                    disabled={saving}
                    onClick={() => executeTakeAndEqualizeUnpaid(conflictAmount)}
                    className="w-full text-left p-3 rounded-xl border border-border-color hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors flex items-start gap-3"
                  >
                    <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
                      <Edit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Ödemeyi Al ve Kalan Taksitleri Eşitle</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {conflictAmount.toLocaleString("tr-TR")} ₺ tahsil et, geriye kalan {(orderBalance - conflictAmount).toLocaleString("tr-TR")} ₺ borcu mevcut {installments.filter(i => !i.isPaid).length} adet takside eşit olarak bölüştür.
                      </p>
                    </div>
                  </button>
                )}

                <button
                  disabled={saving}
                  onClick={() => {
                    executeFastPay(conflictAmount);
                    setConflictAmount(null);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-border-color hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Ödemeyi Al (Taksitleri Ben Düzenleyeceğim)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{conflictAmount.toLocaleString("tr-TR")} ₺ tahsil et ancak planlanan taksitlere dokunma. Daha sonra kendim silecek/düzenleyeceğim.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overpay Modal */}
      {overpayAmount !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border-color rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-5 border-b border-border-color bg-red-500/10">
              <div className="bg-red-500/20 p-2 rounded-full">
                <CheckCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Fazladan Giriş Yapıyorsunuz</h3>
                <p className="text-xs text-muted-foreground font-medium">Bakiye sınırını aştınız.</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border-color">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Kalan Borç (Bakiye):</span>
                <span className="text-sm font-bold text-foreground">{orderBalance.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex items-center justify-between bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                <span className="text-xs font-semibold text-emerald-600 uppercase">Girmek İstediğiniz Tutar:</span>
                <span className="text-sm font-bold text-emerald-600">{overpayAmount.toLocaleString("tr-TR")} ₺</span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                Alacaklı olduğumuzdan daha yüksek bir tutar girdiniz. Lütfen ne yapmak istediğinizi seçin:
              </p>
            </div>
            <div className="p-3 border-t border-border-color bg-muted/10 flex flex-col gap-2">
              <button 
                onClick={() => setOverpayAmount(null)} 
                className="w-full py-2.5 rounded-xl border border-border-color text-sm font-bold hover:bg-muted transition-colors text-foreground"
              >
                İptal Et (İşlemi Kapat)
              </button>
              <button 
                onClick={() => executeFastPay(orderBalance)} 
                className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm"
              >
                Sadece Kalanı Al (Borcu Sıfırla)
              </button>
              {orderTotalPrice !== null && (
                <button 
                  onClick={() => executeOverpayIncrease(overpayAmount)} 
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  Satış Fiyatını Artır ({overpayAmount} ₺ Al)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Installment Overpay Modal */}
      {installmentOverpay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border-color rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border-color bg-red-500/10">
              <h3 className="font-semibold text-red-600 dark:text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Bakiye Aşımı Tespit Edildi
              </h3>
              <button disabled={saving} onClick={() => setInstallmentOverpay(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-sm text-foreground space-y-4">
              <p className="leading-relaxed">
                Tahsil etmek istediğiniz taksitin tutarı (<span className="font-bold">{installmentOverpay.amount.toLocaleString("tr-TR")} ₺</span>), siparişin kalan bakiyesinden (<span className="font-bold">{orderBalance.toLocaleString("tr-TR")} ₺</span>) <span className="font-bold text-red-500">{(installmentOverpay.amount - orderBalance).toLocaleString("tr-TR")} ₺ daha büyük!</span>
              </p>
              
              <div className="flex flex-col gap-3 mt-5">
                <button
                  disabled={saving}
                  onClick={() => executeReduceAndPay(installmentOverpay)}
                  className="w-full text-left p-3 rounded-xl border border-border-color hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Taksiti Düşür ve Ödemeyi Al</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Taksit tutarını <span className="font-medium text-foreground">{orderBalance.toLocaleString("tr-TR")} ₺</span> olarak güncelle ve ödemeyi kaydet.</p>
                  </div>
                </button>

                {orderTotalPrice !== null && (
                  <button
                    disabled={saving}
                    onClick={() => executeIncreasePriceAndPay(installmentOverpay)}
                    className="w-full text-left p-3 rounded-xl border border-border-color hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors flex items-start gap-3"
                  >
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Satış Fiyatını Artır ve Ödemeyi Al</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Siparişin satış fiyatını <span className="font-medium text-foreground">{(installmentOverpay.amount - orderBalance).toLocaleString("tr-TR")} ₺</span> artırarak <span className="font-medium text-foreground">{installmentOverpay.amount.toLocaleString("tr-TR")} ₺</span> tutarındaki ödemeyi tam olarak tahsil et.</p>
                    </div>
                  </button>
                )}

                <button
                  disabled={saving}
                  onClick={() => setInstallmentOverpay(null)}
                  className="w-full text-left p-3 rounded-xl border border-border-color hover:border-red-500/50 hover:bg-red-500/5 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                    <X className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">İptal Et</p>
                    <p className="text-xs text-muted-foreground mt-0.5">İşlemi iptal et ve menüye dön.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overplan Modal */}
      {overplanAmount !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border-color rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-5 border-b border-border-color bg-amber-500/10">
              <div className="bg-amber-500/20 p-2 rounded-full">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Fazladan Taksitlendirme</h3>
                <p className="text-xs text-muted-foreground font-medium">Planlanmamış bakiye sınırını aştınız.</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border-color">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Planlanmamış Bakiye:</span>
                <span className="text-sm font-bold text-foreground">{Math.max(0, orderBalance - unpaidPlanned).toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex items-center justify-between bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                <span className="text-xs font-semibold text-amber-600 uppercase">Girmek İstediğiniz Taksit:</span>
                <span className="text-sm font-bold text-amber-600">{overplanAmount.toLocaleString("tr-TR")} ₺</span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                Girmek istediğiniz taksit tutarı, siparişin henüz taksitlendirilmemiş boştaki bakiyesinden daha büyük. Lütfen ne yapmak istediğinizi seçin:
              </p>
            </div>
            <div className="p-3 border-t border-border-color bg-muted/10 flex flex-col gap-2">
              <button 
                disabled={saving}
                onClick={() => { setOverplanAmount(null); setOverplanDate(null); }} 
                className="w-full text-left p-3 rounded-xl border border-border-color hover:border-red-500/50 hover:bg-red-500/5 transition-colors flex items-start gap-3"
              >
                <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                  <X className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">İşlemi İptal Et</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Taksit eklemekten vazgeç.</p>
                </div>
              </button>
              {(orderBalance - unpaidPlanned) > 0 && (
                <button 
                  disabled={saving}
                  onClick={() => {
                    if (overplanDate) {
                      executeAddInstallment((orderBalance - unpaidPlanned), overplanDate);
                    }
                  }} 
                  className="w-full text-left p-3 rounded-xl border border-border-color hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Taksit Değerini Düşürelim ({Math.max(0, orderBalance - unpaidPlanned).toLocaleString("tr-TR")} ₺)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Sadece boşta kalan bakiye kadar taksit oluştur.</p>
                  </div>
                </button>
              )}
              {orderTotalPrice !== null && (
                <button 
                  disabled={saving}
                  onClick={() => {
                    if (overplanDate) {
                      executeOverplanIncrease(overplanAmount, overplanDate);
                    }
                  }} 
                  className="w-full text-left p-3 rounded-xl border border-border-color hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Satış Fiyatını Artır ({(overplanAmount - (orderBalance - unpaidPlanned)).toLocaleString("tr-TR")} ₺ Ekle)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Toplam sipariş tutarını artır ve {overplanAmount.toLocaleString("tr-TR")} ₺ taksit ekle.</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Edit Overplan Modal */}
      {editOverplanId && editOverplanDiff !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface shadow-2xl rounded-2xl w-full max-w-md overflow-hidden border border-border-color">
            <div className="p-5 pb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">Taksit Tutarı Yüksek</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Bakiye yetersiz</p>
                </div>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-xs text-foreground/80 font-medium">
                  Taksit tutarını güncellediğinizde, toplam planlanan taksitler siparişin kalan bakiyesini <strong>{editOverplanDiff.toLocaleString("tr-TR")} ₺</strong> aşmaktadır.
                </p>
              </div>
            </div>
            <div className="p-3 border-t border-border-color bg-muted/10 flex flex-col gap-2">
              <button 
                disabled={saving}
                onClick={() => { setEditOverplanId(null); setEditOverplanDiff(null); }} 
                className="w-full text-left p-3 rounded-xl border border-border-color hover:border-red-500/50 hover:bg-red-500/5 transition-colors flex items-start gap-3"
              >
                <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                  <X className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">İşlemi İptal Et</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Düzenlemekten vazgeç.</p>
                </div>
              </button>
              {orderTotalPrice !== null && (
                <button 
                  disabled={saving}
                  onClick={executeEditOverplanIncrease} 
                  className="w-full text-left p-3 rounded-xl border border-border-color hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Satış Fiyatını Artır ({editOverplanDiff.toLocaleString("tr-TR")} ₺ Ekle)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Sipariş tutarını artırarak bu taksiti kaydet.</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
