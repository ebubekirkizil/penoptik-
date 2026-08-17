import sys
import re

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/finance/FinanceClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if 'import { useRouter }' not in content:
    content = content.replace('import React, { useState, useMemo } from "react";', 'import React, { useState, useMemo } from "react";\nimport { useRouter } from "next/navigation";')

# 2. Add useRouter and new state
hook_injection = """export default function FinanceClient() {
  const router = useRouter();
  
  const [customerDebts, setCustomerDebts] = useState([
    { id: "CUST-001", customer: "Zeynep Kaya", desc: "Çerçeve Ön Ödemesi Sonrası Kalan", amount: 3200, date: "15 Kasım 2026", status: "Gecikti" },
    { id: "CUST-002", customer: "Ahmet Yılmaz", desc: "Optik Cam Kalan Bakiye", amount: 1500, date: "12 Aralık 2026", status: "Bekliyor" }
  ]);
  
  const [debtPaymentModal, setDebtPaymentModal] = useState({ isOpen: false, id: "", customer: "", amount: "", maxAmount: 0 });
  
  const handleDebtPayment = () => {
    const paymentAmt = parseFloat(debtPaymentModal.amount);
    if (isNaN(paymentAmt) || paymentAmt <= 0) return;
    
    setCustomerDebts(prev => prev.map(d => {
      if (d.id === debtPaymentModal.id) {
        return { ...d, amount: Math.max(0, d.amount - paymentAmt) };
      }
      return d;
    }).filter(d => d.amount > 0));
    
    setToastMessage(`${debtPaymentModal.customer} adlı müşteriden ${paymentAmt.toLocaleString("tr-TR")} ₺ tahsil edildi.`);
    setDebtPaymentModal({ isOpen: false, id: "", customer: "", amount: "", maxAmount: 0 });
    setTimeout(() => setToastMessage(null), 3000);
  };
"""
content = content.replace("export default function FinanceClient() {", hook_injection)

# 3. Modify the inline array to use the new state and add double click and payment button
old_debts = """              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {[
                  { customer: "Zeynep Kaya", desc: "Çerçeve Ön Ödemesi Sonrası Kalan", amount: 3200, date: "15 Kasım 2026", status: "Gecikti" },
                  { customer: "Ahmet Yılmaz", desc: "Optik Cam Kalan Bakiye", amount: 1500, date: "12 Aralık 2026", status: "Bekliyor" }
                ].map((item, i) => (
                  <div key={i} className={`p-5 md:p-6 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-5 transition-all hover:shadow-md ${item.status === 'Gecikti' ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/30 dark:bg-rose-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'}`}>
                    <div className="flex items-center gap-4">"""

new_debts = """              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {customerDebts.map((item, i) => (
                  <div key={item.id} onDoubleClick={() => router.push('/demo/sample-optic/customers/' + item.id)} className={`p-5 md:p-6 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-5 transition-all hover:shadow-md cursor-pointer group ${item.status === 'Gecikti' ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/30 dark:bg-rose-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'}`}>
                    <div className="flex items-center gap-4">"""

if old_debts in content:
    content = content.replace(old_debts, new_debts)

old_amount = """                    <div className="text-left sm:text-right flex items-center sm:pl-0 pl-16">
                      <span className="font-black font-mono text-slate-900 dark:text-white text-2xl tracking-tight whitespace-nowrap">{item.amount.toLocaleString("tr-TR")} ₺</span>
                    </div>
                  </div>"""
                  
new_amount = """                    <div className="text-left sm:text-right flex items-center gap-4 sm:pl-0 pl-16">
                      <span className="font-black font-mono text-slate-900 dark:text-white text-2xl tracking-tight whitespace-nowrap">{item.amount.toLocaleString("tr-TR")} ₺</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDebtPaymentModal({ isOpen: true, id: item.id, customer: item.customer, amount: item.amount.toString(), maxAmount: item.amount }); }}
                        className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-xl transition-colors shadow-sm"
                        title="Tahsilat Yap"
                      >
                        <Wallet className="w-5 h-5" />
                      </button>
                    </div>
                  </div>"""

if old_amount in content:
    content = content.replace(old_amount, new_amount)


# 4. Add the Modal JSX at the end of the return statement
modal_jsx = """      {debtPaymentModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setDebtPaymentModal({...debtPaymentModal, isOpen: false})}>
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-sm w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Tahsilat Al</h3>
                  <p className="text-xs text-slate-500">{debtPaymentModal.customer}</p>
                </div>
              </div>
              <button onClick={() => setDebtPaymentModal({...debtPaymentModal, isOpen: false})} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tahsil Edilecek Tutar (₺)</label>
              <input 
                type="number" 
                value={debtPaymentModal.amount}
                onChange={e => setDebtPaymentModal({...debtPaymentModal, amount: e.target.value})}
                max={debtPaymentModal.maxAmount}
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
              />
              <p className="text-xs text-slate-500 mt-2">Kalan Borç: <span className="font-bold text-slate-700 dark:text-slate-300">{debtPaymentModal.maxAmount.toLocaleString("tr-TR")} ₺</span></p>
            </div>
            
            <button 
              onClick={handleDebtPayment}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Ödemeyi Onayla
            </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}"""

content = content.replace("{/* TOAST NOTIFICATION */}", modal_jsx)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Added customer detail double click and debt payment modal.")
