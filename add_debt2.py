import sys
import re

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/finance/FinanceClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 2. Add useRouter and new state
old_signature = 'export default function FinanceClient({ initialRecords, initialTab = "OVERVIEW" }: { initialRecords: any[]; initialTab?: string }) {'

hook_injection = """export default function FinanceClient({ initialRecords, initialTab = "OVERVIEW" }: { initialRecords: any[]; initialTab?: string }) {
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

if old_signature in content:
    content = content.replace(old_signature, hook_injection)
    print("Logic added")
else:
    print("Logic NOT added")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

