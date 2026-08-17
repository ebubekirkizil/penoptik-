"use client";

import { useState } from "react";
import { createShift, deleteShift, createPayroll, markPayrollAsPaid } from "../hr-actions";
import { Plus, Trash2, CheckCircle, Clock, CalendarDays, Wallet } from "lucide-react";

export default function HRDetailClient({ employee, shifts, payrolls }: { employee: any, shifts: any[], payrolls: any[] }) {
  const [shiftDate, setShiftDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [overtime, setOvertime] = useState("");

  const [prMonth, setPrMonth] = useState(new Date().getMonth() + 1);
  const [prYear, setPrYear] = useState(new Date().getFullYear());
  const [prBonus, setPrBonus] = useState(0);

  const inp = "w-full bg-surface/50 border border-border-color rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const lbl = "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2";

  async function handleAddShift(e: any) {
    e.preventDefault();
    if (!shiftDate) return;
    await createShift(employee.id, { date: shiftDate, checkIn, checkOut, overtimeHours: parseFloat(overtime) });
    setShiftDate(""); setCheckIn(""); setCheckOut(""); setOvertime("");
  }

  async function handleCreatePayroll(e: any) {
    e.preventDefault();
    const baseSalary = employee.salary || 0;
    const sgkTax = (baseSalary * (employee.sgkTaxRate || 20)) / 100;
    await createPayroll(employee.id, {
      month: prMonth,
      year: prYear,
      baseSalary,
      bonus: prBonus,
      sgkTax
    });
    setPrBonus(0);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* VARDİYA / MESAİ */}
      <div className="space-y-6">
        <div className="bg-surface/50 border border-border-color rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Yeni Vardiya / Mesai Ekle
          </h2>
          <form onSubmit={handleAddShift} className="space-y-4">
            <div>
              <label className={lbl}>Tarih</label>
              <input type="date" required value={shiftDate} onChange={e => setShiftDate(e.target.value)} className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Giriş Saati</label>
                <input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Çıkış Saati</label>
                <input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Fazla Mesai (Saat)</label>
              <input type="number" step="0.5" min="0" value={overtime} onChange={e => setOvertime(e.target.value)} className={inp} placeholder="Örn: 2.5" />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Ekle
            </button>
          </form>
        </div>

        <div className="bg-surface/50 border border-border-color rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border-color bg-muted/20">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" /> Geçmiş Vardiyalar
            </h3>
          </div>
          <div className="divide-y divide-border-color max-h-[400px] overflow-y-auto">
            {shifts.map(s => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div>
                  <div className="font-bold text-sm text-foreground">{new Date(s.date).toLocaleDateString("tr-TR")}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {s.checkIn ? new Date(s.checkIn).toLocaleTimeString("tr-TR", {hour:'2-digit', minute:'2-digit'}) : '--:--'} - 
                    {s.checkOut ? new Date(s.checkOut).toLocaleTimeString("tr-TR", {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                    {s.overtimeHours > 0 && <span className="ml-2 text-amber-500 font-medium">+{s.overtimeHours}s mesai</span>}
                  </div>
                </div>
                <button onClick={() => deleteShift(s.id, employee.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {shifts.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Vardiya kaydı bulunamadı.</div>}
          </div>
        </div>
      </div>

      {/* BORDRO / MAAŞ */}
      <div className="space-y-6">
        <div className="bg-surface/50 border border-border-color rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500" /> Maaş & Prim Tahakkuku
          </h2>
          <form onSubmit={handleCreatePayroll} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Ay</label>
                <input type="number" min="1" max="12" required value={prMonth} onChange={e => setPrMonth(parseInt(e.target.value))} className={inp} />
              </div>
              <div>
                <label className={lbl}>Yıl</label>
                <input type="number" min="2020" required value={prYear} onChange={e => setPrYear(parseInt(e.target.value))} className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Ek Prim / Bonus (₺)</label>
              <input type="number" min="0" step="0.01" value={prBonus} onChange={e => setPrBonus(parseFloat(e.target.value))} className={inp} placeholder="0" />
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-xl">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Taban Maaş:</span>
                <span className="font-bold">{employee.salary || 0} ₺</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">SGK Vergi (%{employee.sgkTaxRate}):</span>
                <span className="font-bold text-rose-500">-{( (employee.salary || 0) * (employee.sgkTaxRate || 20) ) / 100} ₺</span>
              </div>
              <div className="flex justify-between text-sm pt-2 mt-2 border-t border-emerald-200/50 dark:border-emerald-700/50">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Ödenecek Net Maaş:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  { (employee.salary || 0) + (prBonus || 0) - ((employee.salary || 0) * (employee.sgkTaxRate || 20) / 100) } ₺
                </span>
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <CheckCircle className="w-4 h-4" /> Bordroyu Onayla ve Finansa Ekle
            </button>
            <p className="text-[10px] text-muted-foreground text-center">Bordro onaylandığında Finans Defterine "Planlanan Gider" olarak otomatik işlenir.</p>
          </form>
        </div>

        <div className="bg-surface/50 border border-border-color rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border-color bg-muted/20">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              Geçmiş Bordrolar
            </h3>
          </div>
          <div className="divide-y divide-border-color max-h-[400px] overflow-y-auto">
            {payrolls.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div>
                  <div className="font-bold text-sm text-foreground">{p.month} / {p.year}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Net: <span className="font-bold text-foreground">{p.netPay.toLocaleString("tr-TR")} ₺</span> | 
                    Prim: {p.bonus} ₺ | 
                    Vergi: <span className="text-rose-500">{p.sgkTax} ₺</span>
                  </div>
                </div>
                {p.isPaid ? (
                   <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">Ödendi</span>
                ) : (
                   <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full">Bekliyor</span>
                )}
              </div>
            ))}
            {payrolls.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Bordro kaydı bulunamadı.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
