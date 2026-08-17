"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Receipt, TrendingUp, TrendingDown, Plus, Search, Calendar, FileText,
  CalendarDays,
      PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Building, User, Info, X, DollarSign, Filter, PieChart, Wallet, CreditCard, Banknote, CheckCircle2, AlertCircle, ChevronRight, Settings, Landmark, Users, Briefcase, Trash2, Edit2, CheckCircle, Circle, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

type ChartPeriod = "WEEKLY" | "MONTHLY" | "3_MONTHS" | "6_MONTHS" | "YEARLY";

// Grafik için mock veri
const generateMockChartData = (period: ChartPeriod) => {
  let labels = [];
  let dataPoints = 0;
  
  if (period === "WEEKLY") {
    labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    dataPoints = 7;
  } else if (period === "MONTHLY") {
    labels = ["1. Hf", "2. Hf", "3. Hf", "4. Hf"];
    dataPoints = 4;
  } else if (period === "3_MONTHS") {
    labels = ["May", "Haz", "Tem"];
    dataPoints = 3;
  } else if (period === "YEARLY") {
    labels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    dataPoints = 12;
  } else {
    // 6_MONTHS
    labels = ["Şub", "Mar", "Nis", "May", "Haz", "Tem"];
    dataPoints = 6;
  }
  
  return labels.map(label => {
    const scale = period === "WEEKLY" ? 8000 : period === "MONTHLY" ? 25000 : period === "YEARLY" ? 150000 : 50000;
    const income = Math.floor(Math.random() * scale) + (scale * 0.6);
    const expense = Math.floor(Math.random() * (scale * 0.5)) + (scale * 0.2);
    return {
      month: label,
      Gelir: income,
      Gider: expense,
      NetKar: income - expense
    };
  });
};

export default function FinanceClient({ initialRecords, initialDebts = [], initialPlannedPayments = [], initialTab = "OVERVIEW" }: { initialRecords: any[]; initialDebts?: any[]; initialPlannedPayments?: any[]; initialTab?: string }) {
  const router = useRouter();
  
  const [customerDebts, setCustomerDebts] = useState(initialDebts.length > 0 ? initialDebts : [
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

  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || initialTab;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  
  // Chart Period State
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("6_MONTHS");
  const [debtFilter, setDebtFilter] = useState<"ALL" | "OVERDUE" | "UPCOMING" | "UNPLANNED">("ALL");

  const filteredDebts = useMemo(() => {
    if (debtFilter === "OVERDUE") {
      return customerDebts.filter(c => c.rawDate && new Date(c.rawDate) < new Date());
    }
    if (debtFilter === "UPCOMING") {
      return customerDebts.filter(c => c.rawDate && new Date(c.rawDate) >= new Date());
    }
    if (debtFilter === "UNPLANNED") {
      return customerDebts.filter(c => !c.rawDate);
    }
    return customerDebts;
  }, [customerDebts, debtFilter]);
  
  // Settings State
  const [companyType, setCompanyType] = useState<"SAHIS" | "LTD" | "AS" | "KOOP">("SAHIS");
  const [taxMethod, setTaxMethod] = useState<"SIMPLE" | "PROGRESSIVE">("PROGRESSIVE");
  
  // Modals
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Dynamic Planned Items State
  const [plannedIncomes, setPlannedIncomes] = useState<any[]>([]);
  const [plannedExpenses, setPlannedExpenses] = useState<any[]>([]);

  const [isPlannedFormOpen, setIsPlannedFormOpen] = useState(false);
  const [plannedFormType, setPlannedFormType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [editingPlannedItem, setEditingPlannedItem] = useState<any>(null);
  const [plannedFormData, setPlannedFormData] = useState({ title: "", amount: "", startDate: "", endDate: "", notes: "" });

  const [confirmationModal, setConfirmationModal] = useState<{isOpen: boolean, actionType: "PAY" | "UNPAY", type: "INCOME" | "EXPENSE", itemId: string}>({ isOpen: false, actionType: "PAY", type: "INCOME", itemId: "" });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Planned Form Handlers
  const handleOpenPlannedForm = (type: "INCOME" | "EXPENSE", item: any = null) => {
    setPlannedFormType(type);
    if (item) {
      setEditingPlannedItem(item);
      setPlannedFormData({ title: item.title, amount: item.amount.toString(), startDate: item.startDate || "", endDate: item.endDate || "", notes: item.notes || "" });
    } else {
      setEditingPlannedItem(null);
      setPlannedFormData({ title: "", amount: "", startDate: "", endDate: "", notes: "" });
    }
    setIsPlannedFormOpen(true);
  };

    useEffect(() => {
    fetch('/api/finance/planned')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.incomes)) setPlannedIncomes(data.incomes);
        if (data && Array.isArray(data.expenses)) setPlannedExpenses(data.expenses);
      })
      .catch(err => console.error(err));
  }, []);

  const savePlannedToDb = async (incomes, expenses) => {
    try {
      await fetch('/api/finance/planned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incomes, expenses })
      });
    } catch(e) {}
  };

  useEffect(() => {
    fetch('/api/finance/tax')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.records)) setTaxRecords(data.records);
      })
      .catch(err => console.error(err));
  }, []);

  const saveTaxToDb = async (records) => {
    try {
      await fetch('/api/finance/tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });
    } catch(e) {}
  };

const handleSavePlannedForm = () => {
    const newItem = {
      id: editingPlannedItem ? editingPlannedItem.id : Math.random().toString(36).substr(2, 9),
      title: plannedFormData.title,
      amount: parseFloat(plannedFormData.amount) || 0,
      startDate: plannedFormData.startDate,
      endDate: plannedFormData.endDate,
      notes: plannedFormData.notes,
      isPaid: editingPlannedItem ? editingPlannedItem.isPaid : false
    };

    if (plannedFormType === "INCOME") {
      if (editingPlannedItem) {
        setPlannedIncomes(plannedIncomes.map(inc => inc.id === editingPlannedItem.id ? newItem : inc));
      } else {
        setPlannedIncomes([...plannedIncomes, newItem]);
      }
    } else {
      if (editingPlannedItem) {
        setPlannedExpenses(plannedExpenses.map(exp => exp.id === editingPlannedItem.id ? newItem : exp));
      } else {
        setPlannedExpenses([...plannedExpenses, newItem]);
      }
    }
    setIsPlannedFormOpen(false);
  };

  const handleDeletePlannedItem = (type: "INCOME" | "EXPENSE", id: string) => {
    if (type === "INCOME") {
      setPlannedIncomes(plannedIncomes.filter(inc => inc.id !== id));
    } else {
      setPlannedExpenses(plannedExpenses.filter(exp => exp.id !== id));
    }
  };

  const requestTogglePaid = (type: "INCOME" | "EXPENSE", item: any) => {
    setConfirmationModal({
      isOpen: true,
      actionType: item.isPaid ? "UNPAY" : "PAY",
      type,
      itemId: item.id
    });
  };

  const confirmTogglePaid = () => {
    const { type, itemId } = confirmationModal;
    if (type === "INCOME") {
      setPlannedIncomes(plannedIncomes.map(inc => inc.id === itemId ? { ...inc, isPaid: !inc.isPaid } : inc));
    } else {
      setPlannedExpenses(plannedExpenses.map(exp => exp.id === itemId ? { ...exp, isPaid: !exp.isPaid } : exp));
    }
    setConfirmationModal({ ...confirmationModal, isOpen: false });
  };

  // Global POS Settings
  const [globalPosAgreementType, setGlobalPosAgreementType] = useState<"COMMISSION" | "MONTHLY_FEE">("COMMISSION");
  const [globalPosCommission, setGlobalPosCommission] = useState("2.5");
  const [globalPosBlockingDays, setGlobalPosBlockingDays] = useState("30");
  const [globalPosMonthlyFee, setGlobalPosMonthlyFee] = useState("500");
  const [globalPosBankName, setGlobalPosBankName] = useState("");
  const [globalPosType, setGlobalPosType] = useState<"PHYSICAL" | "VIRTUAL">("PHYSICAL");
  const [globalPosMonthlyBlockingDays, setGlobalPosMonthlyBlockingDays] = useState("1");
  const [posInstallments, setPosInstallments] = useState([
    { count: "1", rate: "2.5" },
    { count: "3", rate: "3.5" },
    { count: "6", rate: "5.0" },
    { count: "12", rate: "8.0" },
  ]);

  // Calendar State
  const today = new Date();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarAheadDays, setCalendarAheadDays] = useState(5);

  // 4 Özelleştirilebilir Stat Kart State
  type WidgetMetric = "expense_pending" | "income_pending" | "net_balance" | "expense_paid" | "income_received" | "total_expenses" | "total_incomes" | "upcoming_7days";
  const WIDGET_LABELS: Record<WidgetMetric, string> = {
    expense_pending: "Bu Ay Ödenecek",
    income_pending: "Bu Ay Alınacak",
    net_balance: "Net Durum",
    expense_paid: "Ödenen Gider",
    income_received: "Tahsil Edilen Gelir",
    total_expenses: "Toplam Planlı Gider",
    total_incomes: "Toplam Planlı Gelir",
    upcoming_7days: "7 Gün İçinde Ödenecek",
  };
  const [widgets, setWidgets] = useState<[WidgetMetric, WidgetMetric, WidgetMetric, WidgetMetric]>([
    "expense_pending",
    "income_pending",
    "net_balance",
    "upcoming_7days",
  ]);
  const [editingWidget, setEditingWidget] = useState<number | null>(null);

  const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

  const calendarItems = (() => {
    const startDate = new Date(calendarYear, calendarMonth, 1);
    const endDate = new Date(calendarYear, calendarMonth + 1, calendarAheadDays);
    const allItems = [
      ...plannedExpenses.map(i => ({ ...i, kind: "EXPENSE" as const })),
      ...plannedIncomes.map(i => ({ ...i, kind: "INCOME" as const }))
    ];
    return allItems.filter(item => {
      if (!item.startDate) return false;
      const start = new Date(item.startDate);
      const end = item.endDate ? new Date(item.endDate) : new Date("2099-01-01");
      return start <= endDate && end >= startDate;
    });
  })();

  // Tax Records State
  const [taxRecords, setTaxRecords] = useState<any[]>([]);
  const [isTaxFormOpen, setIsTaxFormOpen] = useState(false);
  const [editingTaxItem, setEditingTaxItem] = useState<any>(null);
  const [taxFormData, setTaxFormData] = useState({ type: "KDV", period: "", amount: "", dueDate: "", notes: "" });

  const handleSaveTaxRecord = () => {
    const newItem = {
      id: editingTaxItem ? editingTaxItem.id : Math.random().toString(36).substr(2, 9),
      type: taxFormData.type,
      period: taxFormData.period,
      amount: parseFloat(taxFormData.amount) || 0,
      dueDate: taxFormData.dueDate,
      isPaid: editingTaxItem ? editingTaxItem.isPaid : false,
      notes: taxFormData.notes,
    };
    if (editingTaxItem) {
      setTaxRecords(taxRecords.map(r => r.id === editingTaxItem.id ? newItem : r));
    } else {
      setTaxRecords([...taxRecords, newItem]);
    }
    setIsTaxFormOpen(false);
  };

  const TAX_TYPE_LABELS: Record<string,string> = {
    KDV: "KDV (Katma Değer Vergisi)",
    MUHTASAR: "Muhtasar (Stopaj)",
    GELIR_VERGISI: "Gelir Vergisi",
    KURUMLAR_VERGISI: "Kurumlar Vergisi",
    GECICI_VERGI: "Geçici Vergi",
    DIGER: "Diğer"
  };

  // New Record Form State
  const [newRecordType, setNewRecordType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [newRecordData, setNewRecordData] = useState({
    title: "",
    amount: "",
    taxRate: "20",
    customTaxRate: "",
    category: "Satis",
    paymentMethod: "Kredi Kartı",
    desc: "",
    posAgreementType: globalPosAgreementType,
    posCommissionRate: globalPosCommission,
    posBlockingDays: globalPosBlockingDays,
    posMonthlyFee: globalPosMonthlyFee
  });

  const filteredRecords = useMemo(() => {
    let result = initialRecords;
    
    if (filterType === "INCOME") result = result.filter(r => r.type === "INCOME" || r.amount > 0);
    if (filterType === "EXPENSE") result = result.filter(r => r.type === "EXPENSE" || r.amount < 0);
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => r.description?.toLowerCase().includes(lower));
    }
    
    return result;
  }, [initialRecords, searchTerm, filterType]);

  // Gelişmiş Vergi Hesaplama Algoritması
  const calculateTax = (profit: number) => {
    if (profit <= 0) return 0;
    
    if (companyType === "LTD" || companyType === "AS") {
      return profit * 0.25; // %25 Sabit Kurumlar Vergisi
    }
    
    if (companyType === "KOOP") {
      return profit * 0.20; // Kooperatif Örneği
    }
    
    if (companyType === "SAHIS") {
      if (taxMethod === "SIMPLE") return profit * 0.15; // Sabit Gösterim
      
      // Türkiye Şahıs Şirketi Kademeli Gelir Vergisi Simülasyonu
      if (profit <= 110000) return profit * 0.15;
      if (profit <= 230000) return 16500 + (profit - 110000) * 0.20;
      if (profit <= 870000) return 40500 + (profit - 230000) * 0.27;
      if (profit <= 3000000) return 213300 + (profit - 870000) * 0.35;
      return 958800 + (profit - 3000000) * 0.40;
    }
    return 0;
  };

  const { totalIncome, totalCost, totalKdv, netProfit, calculatedTax } = useMemo(() => {
    let inc = 0, cost = 0, kdv = 0;
    
    initialRecords.forEach(r => {
       if (r.type === "INCOME" || r.amount > 0) {
          inc += r.amount || 0;
          cost += r.cost || 0;
          kdv += r.tax || 0;
       }
    });

    const baseProfit = inc - cost - kdv;
    const calcTax = calculateTax(baseProfit);
    const profit = baseProfit - calcTax;

    return { totalIncome: inc, totalCost: cost, totalKdv: kdv, netProfit: profit, calculatedTax: calcTax };
  }, [initialRecords, companyType, taxMethod]);

  const chartData = useMemo(() => generateMockChartData(chartPeriod), [chartPeriod]);

  // Tahmini Vergi Dilimi Uyarı Metni
  const getTaxBracketWarning = () => {
    if (companyType !== "SAHIS" || taxMethod !== "PROGRESSIVE") return null;
    const baseProfit = totalIncome - totalCost - totalKdv;
    if (baseProfit <= 0) return "Şu an kâr elde etmiyorsunuz, vergi yükünüz bulunmuyor.";
    if (baseProfit <= 110000) return "Tahmini kârınız ilk dilimde (110.000 TL altı). %15 gelir vergisi oranına tabisiniz.";
    if (baseProfit <= 230000) return "Tahmini kârınız ikinci dilimde (230.000 TL'ye kadar). %20 gelir vergisi oranına tabisiniz.";
    if (baseProfit <= 870000) return "Tahmini kârınız üçüncü dilimde (870.000 TL'ye kadar). %27 gelir vergisi oranına tabisiniz.";
    if (baseProfit <= 3000000) return "Tahmini kârınız dördüncü dilimde (3.000.000 TL'ye kadar). %35 gelir vergisi oranına tabisiniz.";
    return "Tahmini kârınız en üst dilimde (3.000.000 TL üzeri). %40 gelir vergisi oranına tabisiniz.";
  };

  const currentTaxRate = newRecordData.taxRate === "CUSTOM" 
    ? (parseFloat(newRecordData.customTaxRate) || 0) 
    : parseFloat(newRecordData.taxRate);

  const parsedAmount = parseFloat(newRecordData.amount) || 0;
  const calculatedVat = parsedAmount - (parsedAmount / (1 + (currentTaxRate / 100)));
  
  // Kredi Kartı & POS Komisyon Hesabı
  let posCommission = 0;
  if (newRecordData.paymentMethod === "Kredi Kartı" && newRecordData.posAgreementType === "COMMISSION") {
    const rate = parseFloat(newRecordData.posCommissionRate) || 0;
    posCommission = parsedAmount * (rate / 100);
  } else if (newRecordData.paymentMethod === "Kredi Kartı" && newRecordData.posAgreementType === "MONTHLY_FEE") {
    // Aylık sabit aidatta işlem başı komisyon düşülmez (veya çok düşük banka/Bsmv kesintisi olabilir, şimdilik 0)
    posCommission = 0; 
  }

  const netAmount = parsedAmount - calculatedVat - posCommission;

  // Mock Planlı Ödemeler Verisi
  const [plannedPayments, setPlannedPayments] = useState(initialPlannedPayments.length > 0 ? initialPlannedPayments : [
    { title: "Ofis Kirası", amount: 25000, daysLeft: 2, isUrgent: true, type: "Gider" },
    { title: "SGK Primleri", amount: 14500, daysLeft: 5, isUrgent: false, type: "Gider" },
    { title: "Yazılım Abonelikleri", amount: 3200, daysLeft: 12, isUrgent: false, type: "Gider" },
    { title: "Kurumsal Müşteri Tahsilatı", amount: 45000, daysLeft: 3, isUrgent: false, type: "Gelir" }
  ]);

  return (
    <>
      <div className="page-container space-y-8  relative min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Landmark className="w-7 h-7 text-blue-600 dark:text-blue-500" />
          {activeTab === "OVERVIEW" && "Genel Bakış"}
          {activeTab === "TRANSACTIONS" && "İşlemler"}
          {activeTab === "PLANNED_PAYMENTS" && "Planlı Ödemeler"}
          {activeTab === "TAX" && "Vergi Yönetimi"}
          {activeTab === "SETTINGS" && "Finans Ayarları"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          Kurumsal muhasebe, detaylı vergilendirme, gelir/gider operasyonları ve karlılık analizi.
        </p>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          {/* DASHBOARD KARTLARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm border border-emerald-100 dark:border-emerald-800">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Brüt Ciro</h3>
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-black text-slate-900 dark:text-white">{totalIncome.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Toplam ürün satışı ve tahsilatlar</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-sm border border-rose-100 dark:border-rose-800">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Toplam Maliyet</h3>
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-black text-slate-900 dark:text-white">{totalCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Ürün alış ve işletme masrafları</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm border border-amber-100 dark:border-amber-800">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Vergi Yükü</h3>
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-black text-slate-900 dark:text-white">{calculatedTax.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{companyType === "SAHIS" ? "Gelir Vergisi" : companyType === "LTD" ? "Kurumlar Vergisi (%25)" : companyType === "AS" ? "Kurumlar Vergisi (%25)" : "Kooperatif Vergisi"} hesabı üzerinden</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-800">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Net Kâr</h3>
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{netProfit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Vergiler düşüldükten sonraki net tutar</p>
              </div>
            </div>
          </div>

          {/* GRAFİKLER VE ZAMAN FİLTRESİ */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 mt-12 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" /> Detaylı Finansal Analiz
            </h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
              {[
                { id: "WEEKLY", label: "Haftalık" },
                { id: "MONTHLY", label: "Aylık" },
                { id: "3_MONTHS", label: "3 Aylık" },
                { id: "6_MONTHS", label: "6 Aylık" },
                { id: "YEARLY", label: "Yıllık" }
              ].map(period => (
                <button
                  key={period.id}
                  onClick={() => setChartPeriod(period.id as ChartPeriod)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${chartPeriod === period.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* CHARTS GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* GELIR & GIDER BAR CHART */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500/8 to-indigo-500/8 dark:from-blue-500/10 dark:to-indigo-500/10 border-b border-slate-100 dark:border-slate-800 px-6 pt-5 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  Gelir &amp; Gider Analizi
                </h3>
                <p className="text-xs text-slate-400 mt-1">Seçili dönem için karşılaştırmalı bar grafik</p>
              </div>
              <div className="p-6 h-[260px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                      dy={8}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      width={36}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 6 }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 min-w-[140px]">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{label}</p>
                            {payload.map((entry: any, i: number) => (
                              <div key={i} className="flex items-center justify-between gap-4 text-sm font-bold mb-1">
                                <span style={{ color: entry.color }} className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: entry.color }} />
                                  {entry.name}
                                </span>
                                <span className="text-slate-800 dark:text-white font-mono">{(entry.value as number).toLocaleString('tr-TR')} ₺</span>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Legend 
                      iconType="circle" 
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, paddingTop: 16, color: '#64748b', fontWeight: 600 }} 
                    />
                    <Bar dataKey="Gelir" fill="#3b82f6" radius={[5, 5, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="Gider" fill="#f43f5e" radius={[5, 5, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NET KAR LINE CHART */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-emerald-500/8 to-teal-500/8 dark:from-emerald-500/10 dark:to-teal-500/10 border-b border-slate-100 dark:border-slate-800 px-6 pt-5 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Kârlılık Trendi (Net)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Net kâr trendi — aya göre döngüsel analiz</p>
              </div>
              <div className="p-6 h-[260px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                      dy={8}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      width={36}
                    />
                    <Tooltip
                      cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 min-w-[150px]">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{label}</p>
                            <div className="flex items-center justify-between gap-4 text-sm font-bold">
                              <span className="text-emerald-600 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                                Net Kâr
                              </span>
                              <span className="text-slate-800 dark:text-white font-mono">{(payload[0]?.value as number || 0).toLocaleString('tr-TR')} ₺</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend 
                      iconType="circle" 
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, paddingTop: 16, color: '#64748b', fontWeight: 600 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="NetKar" 
                      name="Net Kâr"
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} 
                      activeDot={{ r: 7, strokeWidth: 0, fill: '#10b981' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* PLANLI ÖDEMELER ÖZET (OVERVIEW) */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                Yaklaşan Ödemeler
              </h3>
              <a href="/admin/finance?tab=PLANNED_PAYMENTS" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Tümünü Gör
              </a>
            </div>

            {(() => {
              // daysLeft <= 0 => geciken
              const overdue = plannedPayments.filter(p => p.daysLeft <= 0 && p.type === "Gider").reduce((sum, p) => sum + p.amount, 0);
              const plannedNotOverdue = plannedPayments.filter(p => p.daysLeft > 0 && p.isFixed && p.type === "Gider").reduce((sum, p) => sum + p.amount, 0);
              const unplanned = plannedPayments.filter(p => p.daysLeft > 0 && !p.isFixed && p.type === "Gider").reduce((sum, p) => sum + p.amount, 0);
              
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {/* Planlanan Geciken Ödeme */}
                  <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-800/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-rose-600/80 dark:text-rose-400/80 uppercase tracking-wider mb-1">Planlanan Geciken</p>
                      <p className="text-2xl font-black text-rose-700 dark:text-rose-400">{overdue.toLocaleString('tr-TR')} ₺</p>
                    </div>
                  </div>

                  {/* Planlanan Ödemeler (Gecikmeyen) */}
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider mb-1">Planlanan (Gelecek)</p>
                      <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{plannedNotOverdue.toLocaleString('tr-TR')} ₺</p>
                    </div>
                  </div>

                  {/* Planlanmayan Ödemeler */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Planlanmayan Ödemeler</p>
                      <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{unplanned.toLocaleString('tr-TR')} ₺</p>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {plannedPayments.map((plan, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${plan.isUrgent ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-900/10' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'} flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.type === "Gelir" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                        {plan.type === "Gelir" ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{plan.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{plan.type === "Gelir" ? "Beklenen Tahsilat" : "Düzenli Ödeme"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <span className="font-black text-xl text-slate-900 dark:text-white font-mono">{plan.amount.toLocaleString("tr-TR")} ₺</span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${plan.isUrgent ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{plan.daysLeft} gün kaldı</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === "TRANSACTIONS" && (
        <div className="flex flex-col min-h-[70vh] animate-in fade-in slide-in-from-bottom-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="İşlem Başlığı veya No ara..." 
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm font-medium"
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-2xl text-sm font-semibold transition-all w-full sm:w-auto focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="ALL">Tümü</option>
                <option value="INCOME">Sadece Gelirler</option>
                <option value="EXPENSE">Sadece Giderler</option>
              </select>
              <button onClick={() => setIsNewRecordOpen(true)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto justify-center">
                <Plus className="w-4 h-4" /> Yeni Kayıt
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredRecords.length === 0 ? (
               <div className="bg-white dark:bg-[#1E293B] p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 font-medium">Aramanıza uygun finansal kayıt bulunamadı.</p>
               </div>
            ) : filteredRecords.map((record, i) => {
               let bKar = (record.amount || 0) - (record.cost || 0) - (record.tax || 0);
               let v = calculateTax(bKar);
               let nKar = bKar - v;
               
               // Rastgele ödeme metodu
               const methods = ["Kredi Kartı", "Havale/EFT", "Nakit Kasa"];
               const method = methods[i % 3];

               const isIncome = record.type === "INCOME" || record.amount > 0;

               return (
                <div 
                  key={record.id} 
                  onClick={() => setSelectedRecord({...record, calculatedProfit: nKar, calculatedTax: v, method})}
                  className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-5 min-w-[300px]">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-colors ${isIncome ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-800"}`}>
                      {isIncome ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-1">{record.description}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(record.date).toLocaleDateString("tr-TR")}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {method}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-row items-center justify-between md:justify-end gap-6 md:gap-12 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                    <div className="flex flex-col md:items-end">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Brüt Tutar</span>
                      <span className="font-bold font-mono text-lg text-slate-900 dark:text-white">{Math.abs(record.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
                    </div>
                    
                    <div className="flex flex-col md:items-end">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">KDV & Vergi</span>
                      <span className="font-bold font-mono text-[15px] text-slate-600 dark:text-slate-400">{record.tax?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
                    </div>

                    <div className="flex flex-col md:items-end hidden sm:flex">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Net Kâr/Etki</span>
                      <span className={`font-black font-mono text-lg ${nKar > 0 ? "text-emerald-600 dark:text-emerald-400" : nKar < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}`}>
                        {nKar > 0 ? "+" : ""}{nKar.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </span>
                    </div>

                    <div className="flex items-center">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
               )
            })}
          </div>
        </div>
      )}

      {/* PLANNED PAYMENTS & RECEIVABLES TAB */}
      {activeTab === "PLANNED_PAYMENTS" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">

          {/* Nakit Akışı Özeti (Bento Grid) */}
          {(() => {
            const expPending = plannedExpenses.filter(e => !e.isPaid).reduce((s,i) => s+i.amount, 0);
            const incPending = plannedIncomes.filter(i => !i.isPaid).reduce((s,i) => s+i.amount, 0);
            const net = incPending - expPending;
            
            // Son 7 Gün İçinde Ödenecekler
            const soon = plannedExpenses.filter(e => !e.isPaid && e.nextDueDate && new Date(e.nextDueDate).getTime() < Date.now() + 7*24*60*60*1000).reduce((s,i) => s+i.amount, 0);

            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 rounded-[2rem] p-6 backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-rose-700/70 tracking-widest uppercase">Gider Beklentisi</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-rose-700">{expPending.toLocaleString("tr-TR")} ₺</h3>
                    <p className="text-sm text-rose-600/70 mt-1">Bu ay ödenecek</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[2rem] p-6 backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                      <ArrowDownRight className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700/70 tracking-widest uppercase">Gelir Beklentisi</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-emerald-700">{incPending.toLocaleString("tr-TR")} ₺</h3>
                    <p className="text-sm text-emerald-600/70 mt-1">Bu ay tahsil edilecek</p>
                  </div>
                </div>

                <div className={`bg-gradient-to-br ${net >= 0 ? 'from-teal-500/10 border-teal-500/20' : 'from-orange-500/10 border-orange-500/20'} border rounded-[2rem] p-6 backdrop-blur-xl flex flex-col justify-between md:col-span-2 relative overflow-hidden`}>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-2xl ${net >= 0 ? 'bg-teal-500/20 text-teal-600' : 'bg-orange-500/20 text-orange-600'} flex items-center justify-center`}>
                        {net >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <span className={`text-xs font-bold ${net >= 0 ? 'text-teal-700/70' : 'text-orange-700/70'} tracking-widest uppercase`}>Nakit Akışı (Net)</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className={`text-4xl md:text-5xl font-black ${net >= 0 ? 'text-teal-700' : 'text-orange-700'}`}>
                          {net > 0 ? "+" : ""}{net.toLocaleString("tr-TR")} ₺
                        </h3>
                        <p className={`text-sm mt-1 ${net >= 0 ? 'text-teal-600/70' : 'text-orange-600/70'}`}>Planlanan gelir/gider farkı</p>
                      </div>
                      <div className="hidden lg:flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Acil Çıkış (7 Gün)</p>
                          <p className="font-bold text-rose-600">{soon.toLocaleString("tr-TR")} ₺</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                          <Clock className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative background circle */}
                  <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${net >= 0 ? 'bg-teal-500' : 'bg-orange-500'}`} />
                </div>
              </div>
            );
          })()}

          {/* DÜZENLİ GİDERLER & GELİRLER */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* GİDERLER */}
            <div className="bg-surface/50 border border-border-color rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <span className="w-2 h-6 rounded-full bg-rose-500 block" /> 
                    Düzenli Giderler
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 ml-4">Sabit şirket harcamaları (Kira, Maaş, SGK)</p>
                </div>
                <button onClick={() => handleOpenPlannedForm("EXPENSE")} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 p-2 rounded-xl transition-all active:scale-95">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {plannedExpenses.map((item) => (
                  <div key={item.id} className={`group relative overflow-hidden rounded-2xl border p-4 transition-all hover:shadow-md ${item.isPaid ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border-color bg-background hover:border-rose-500/30'}`}>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => requestTogglePaid("EXPENSE", item)}
                          className={`flex-shrink-0 transition-transform active:scale-90 ${item.isPaid ? 'text-emerald-500' : 'text-slate-300 hover:text-rose-400'}`}
                        >
                          {item.isPaid ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                        </button>
                        <div>
                          <h4 className={`font-bold ${item.isPaid ? 'text-muted-foreground line-through decoration-emerald-500/50' : 'text-foreground'}`}>{item.title}</h4>
                          <div className="flex gap-3 text-[11px] text-muted-foreground mt-1 font-medium">
                            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md"><Calendar className="w-3 h-3"/> {item.startDate ? new Date(item.startDate).toLocaleDateString("tr-TR") : '-'}</span>
                            {item.notes && <span className="flex items-center gap-1 opacity-70"><FileText className="w-3 h-3"/> {item.notes}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-black text-lg ${item.isPaid ? 'text-muted-foreground' : 'text-rose-600'}`}>
                          {item.amount.toLocaleString("tr-TR")} ₺
                        </span>
                        <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenPlannedForm("EXPENSE", item)} className="text-blue-500 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeletePlannedItem("EXPENSE", item.id)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                    {item.isPaid && <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />}
                  </div>
                ))}
                {plannedExpenses.length === 0 && (
                  <div className="py-8 text-center text-sm font-medium text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border-color">
                    Henüz düzenli gider eklenmemiş.
                  </div>
                )}
              </div>
            </div>

            {/* GELİRLER */}
            <div className="bg-surface/50 border border-border-color rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <span className="w-2 h-6 rounded-full bg-emerald-500 block" /> 
                    Düzenli Gelirler
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 ml-4">Planlanan kurumsal alacaklar</p>
                </div>
                <button onClick={() => handleOpenPlannedForm("INCOME")} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl transition-all active:scale-95">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {plannedIncomes.map((item) => (
                  <div key={item.id} className={`group relative overflow-hidden rounded-2xl border p-4 transition-all hover:shadow-md ${item.isPaid ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border-color bg-background hover:border-emerald-500/30'}`}>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => requestTogglePaid("INCOME", item)}
                          className={`flex-shrink-0 transition-transform active:scale-90 ${item.isPaid ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-400'}`}
                        >
                          {item.isPaid ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                        </button>
                        <div>
                          <h4 className={`font-bold ${item.isPaid ? 'text-muted-foreground line-through decoration-emerald-500/50' : 'text-foreground'}`}>{item.title}</h4>
                          <div className="flex gap-3 text-[11px] text-muted-foreground mt-1 font-medium">
                            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md"><Calendar className="w-3 h-3"/> {item.startDate ? new Date(item.startDate).toLocaleDateString("tr-TR") : '-'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-black text-lg ${item.isPaid ? 'text-muted-foreground' : 'text-emerald-600'}`}>
                          {item.amount.toLocaleString("tr-TR")} ₺
                        </span>
                        <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenPlannedForm("INCOME", item)} className="text-blue-500 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeletePlannedItem("INCOME", item.id)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {plannedIncomes.length === 0 && (
                  <div className="py-8 text-center text-sm font-medium text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border-color">
                    Henüz düzenli gelir eklenmemiş.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* MÜŞTERİDEN ALINACAKLAR (TAKSİT & BAKİYE) */}
          <div className="bg-surface/60 border border-border-color rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Müşteriden Alınacaklar
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    Taksitler, kalan bakiyeler ve gecikmiş müşteri ödemeleri
                  </p>
                </div>
              </div>
              <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-auto">
                <button onClick={() => setDebtFilter("ALL")} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${debtFilter === "ALL" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Tümü</button>
                <button onClick={() => setDebtFilter("OVERDUE")} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${debtFilter === "OVERDUE" ? "bg-background shadow-sm text-rose-500" : "text-muted-foreground hover:text-foreground"}`}>Gecikenler</button>
                <button onClick={() => setDebtFilter("UPCOMING")} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${debtFilter === "UPCOMING" ? "bg-background shadow-sm text-blue-500" : "text-muted-foreground hover:text-foreground"}`}>Yaklaşanlar</button>
              </div>
            </div>

            {/* Müşteri Özet Kartları */}
            {(() => {
              const geciken = customerDebts.filter(c => c.rawDate && new Date(c.rawDate) < new Date()).reduce((a,b)=>a+b.amount,0);
              const planli = customerDebts.filter(c => c.rawDate && new Date(c.rawDate) >= new Date()).reduce((a,b)=>a+b.amount,0);
              const plansiz = customerDebts.filter(c => !c.rawDate).reduce((a,b)=>a+b.amount,0);
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <button 
                    onClick={() => setDebtFilter(debtFilter === "OVERDUE" ? "ALL" : "OVERDUE")}
                    className={`text-left rounded-3xl p-5 flex items-center gap-5 transition-all duration-300 hover:scale-[1.02] border-2 ${debtFilter === "OVERDUE" ? "bg-rose-100 dark:bg-rose-500/20 border-rose-500 shadow-md ring-4 ring-rose-500/20" : "bg-rose-50 dark:bg-rose-500/10 border-transparent hover:bg-rose-100/80 dark:hover:bg-rose-500/15"}`}
                  >
                    <div className="w-14 h-14 rounded-full bg-rose-200 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-bold text-rose-700/80 tracking-wider">GECİKEN</p>
                      <h4 className="text-2xl font-black text-rose-700 tracking-tight">{geciken.toLocaleString("tr-TR")} ₺</h4>
                    </div>
                  </button>
                  <button 
                    onClick={() => setDebtFilter(debtFilter === "UPCOMING" ? "ALL" : "UPCOMING")}
                    className={`text-left rounded-3xl p-5 flex items-center gap-5 transition-all duration-300 hover:scale-[1.02] border-2 ${debtFilter === "UPCOMING" ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500 shadow-md ring-4 ring-blue-500/20" : "bg-blue-50 dark:bg-blue-500/10 border-transparent hover:bg-blue-100/80 dark:hover:bg-blue-500/15"}`}
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-200 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-bold text-blue-700/80 tracking-wider">PLANLANAN (GELECEK)</p>
                      <h4 className="text-2xl font-black text-blue-700 tracking-tight">{planli.toLocaleString("tr-TR")} ₺</h4>
                    </div>
                  </button>
                  <button 
                    onClick={() => setDebtFilter(debtFilter === "UNPLANNED" ? "ALL" : "UNPLANNED")}
                    className={`text-left rounded-3xl p-5 flex items-center gap-5 transition-all duration-300 hover:scale-[1.02] border-2 ${debtFilter === "UNPLANNED" ? "bg-slate-200 dark:bg-slate-500/20 border-slate-500 shadow-md ring-4 ring-slate-500/20 dark:ring-slate-400/20" : "bg-slate-100 dark:bg-slate-500/10 border-transparent hover:bg-slate-200/80 dark:hover:bg-slate-500/15"}`}
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-sm border border-slate-300/50 dark:border-slate-600/50">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-bold text-slate-700/80 dark:text-slate-400/80 tracking-wider">PLANLANMAYAN</p>
                      <h4 className="text-2xl font-black text-foreground tracking-tight">{plansiz.toLocaleString("tr-TR")} ₺</h4>
                    </div>
                  </button>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredDebts.map((b) => {
                const isOverdue = b.rawDate && new Date(b.rawDate) < new Date();
                const dueText = b.rawDate ? new Date(b.rawDate).toLocaleDateString("tr-TR") : "Tarih Yok";
                
                return (
                  <div key={b.id} className="group bg-background border border-border-color rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-all hover:border-border-color/80">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm shrink-0 ${isOverdue ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-blue-500 text-white shadow-blue-500/20'}`}>
                        {b.customer?.charAt(0).toUpperCase() || 'M'}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-black text-foreground text-[15px] leading-none tracking-tight">{b.customer}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-md">{b.desc}</span>
                          <span className={`text-[11px] flex items-center gap-1 font-bold ${isOverdue ? 'text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md' : 'text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md'}`}>
                            {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                            {dueText}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Hover Actions (WhatsApp & Tahsil Et) */}
                      <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                        <button 
                          onClick={() => {
                            const msg = encodeURIComponent(`Sayın ${b.customer}, ${b.amount} TL tutarında gecikmiş/planlanan ödemeniz bulunmaktadır. Detaylı bilgi için lütfen mağazamızla iletişime geçiniz.`);
                            window.open(`https://wa.me/?text=${msg}`, '_blank');
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-bold bg-[#25D366]/10 text-[#25D366] px-3 py-2 rounded-lg hover:bg-[#25D366]/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Hatırlat
                        </button>
                        <button className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-500/10 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tahsil Et
                        </button>
                      </div>
                      
                      <div className="text-right pl-2">
                        <span className="font-black text-lg text-foreground tracking-tight">{b.amount.toLocaleString("tr-TR")} ₺</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredDebts.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm font-medium text-muted-foreground">
                  Bu filtreye uygun bekleyen müşteri alacağı bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "SETTINGS" && (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 space-y-8 pb-12">
           
           <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-xl transition-all duration-300">
             <div className="flex items-center gap-4 mb-3">
               <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                 <Building className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Şirket Profili & Kurumsal Yapı</h3>
                 <p className="text-sm text-slate-500">Resmi işletme türünüzü belirleyerek vergi dilimlerinizin otomatik uyarlanmasını sağlayın.</p>
               </div>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-8">
               <button 
                 onClick={() => setCompanyType("SAHIS")}
                 className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${companyType === "SAHIS" ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 shadow-md' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-blue-600/50'}`}
               >
                 <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${companyType === "SAHIS" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                      <User className="w-6 h-6" />
                    </div>
                    {companyType === "SAHIS" && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                 </div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-base">Şahıs Şirketi</h4>
                 <p className="text-xs text-slate-500 mt-2 leading-relaxed">Kademeli gelir vergisi dilimlerine (%15-%40) tabi, bireysel girişimci işletmesi.</p>
               </button>

               <button 
                 onClick={() => setCompanyType("LTD")}
                 className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${companyType === "LTD" ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 shadow-md' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-blue-600/50'}`}
               >
                 <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${companyType === "LTD" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    {companyType === "LTD" && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                 </div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-base">Limited Şti.</h4>
                 <p className="text-xs text-slate-500 mt-2 leading-relaxed">Sabit Kurumlar vergisine tabi, yaygın sermaye şirketi yapısı.</p>
               </button>

               <button 
                 onClick={() => setCompanyType("AS")}
                 className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${companyType === "AS" ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 shadow-md' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-blue-600/50'}`}
               >
                 <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${companyType === "AS" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                      <Landmark className="w-6 h-6" />
                    </div>
                    {companyType === "AS" && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                 </div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-base">Anonim Şti. (A.Ş.)</h4>
                 <p className="text-xs text-slate-500 mt-2 leading-relaxed">Büyük ölçekli yatırımlar ve hisse yapısına uygun anonim şirket.</p>
               </button>

               <button 
                 onClick={() => setCompanyType("KOOP")}
                 className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${companyType === "KOOP" ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 shadow-md' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-blue-600/50'}`}
               >
                 <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${companyType === "KOOP" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                      <Users className="w-6 h-6" />
                    </div>
                    {companyType === "KOOP" && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                 </div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-base">Kooperatif</h4>
                 <p className="text-xs text-slate-500 mt-2 leading-relaxed">Ortaklaşa üretim ve tüketim amaçlı kurulan yasal kooperatif birliği.</p>
               </button>
             </div>

             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
               <h4 className="font-bold text-slate-900 dark:text-white text-base mb-4">Gelişmiş Vergi Hesaplama Metodolojisi</h4>
               
               {companyType === "SAHIS" ? (
                 <div className="flex flex-col md:flex-row gap-4">
                   <label className={`flex-1 flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${taxMethod === "SIMPLE" ? 'border-blue-500 bg-white dark:bg-slate-800 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-transparent'}`}>
                     <input type="radio" checked={taxMethod === "SIMPLE"} onChange={() => setTaxMethod("SIMPLE")} className="w-5 h-5 mt-0.5 text-blue-600 focus:ring-blue-500 border-slate-300" />
                     <div>
                       <p className="font-bold text-base text-slate-900 dark:text-white">Basit Oran (Manuel)</p>
                       <p className="text-sm text-slate-500 mt-1">Tüm kâr üzerinden sabit bir gelir vergisi oranı (varsayılan %15) hesaplar. Özel vergi muafiyeti olan işletmeler için uygundur.</p>
                     </div>
                   </label>
                   
                   <label className={`flex-1 flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${taxMethod === "PROGRESSIVE" ? 'border-blue-500 bg-white dark:bg-slate-800 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-transparent'}`}>
                     <input type="radio" checked={taxMethod === "PROGRESSIVE"} onChange={() => setTaxMethod("PROGRESSIVE")} className="w-5 h-5 mt-0.5 text-blue-600 focus:ring-blue-500 border-slate-300" />
                     <div>
                       <p className="font-bold text-base text-slate-900 dark:text-white">Akıllı Kademeli Dilim Simülasyonu (Tavsiye Edilen)</p>
                       <p className="text-sm text-slate-500 mt-1">Devletin belirlediği güncel %15, %20, %27, %35 ve %40'lık gelir vergisi dilimlerine göre kâr arttıkça artan, son derece hassas detaylı hesaplama yapar.</p>
                       
                       {taxMethod === "PROGRESSIVE" && getTaxBracketWarning() && (
                         <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg flex items-start gap-3">
                           <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                           <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{getTaxBracketWarning()}</p>
                         </div>
                       )}
                     </div>
                   </label>
                 </div>
               ) : (
                 <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white mb-2">Kurumlar Vergisi (Sabit Oran)</p>
                    <p className="text-sm text-slate-500">Seçtiğiniz şirket türü sebebiyle sistem net kâr üzerinden otomatik olarak yasal sabit Kurumlar Vergisi oranını (%25 veya indirimli kooperatif oranı) baz alacaktır. Herhangi bir manuel ayarlama yapmanıza gerek yoktur.</p>
                 </div>
               )}
             </div>
             
             {/* POS & BANKA AYARLARI — GELİŞMİŞ */}
             <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                   <CreditCard className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 dark:text-white text-base">POS & Banka Anlaşmaları (Detaylı)</h4>
                   <p className="text-xs text-slate-500">Taksit komisyonları, bloke süreleri, banka bilgisi ve POS tipi</p>
                 </div>
               </div>

               {/* Banka & POS Tipi */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Banka / POS Sağlayıcısı</label>
                   <select value={globalPosBankName} onChange={e => setGlobalPosBankName(e.target.value)}
                     className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all shadow-sm cursor-pointer">
                     <option value="">Seçiniz...</option>
                     {["Ziraat Bankası","Garanti BBVA","İş Bankası","Yapı Kredi","Akbank","Halkbank","Vakıfbank","QNB Finansbank","Denizbank","iyzico","PayTR","OPTİMUM","Diğer"].map(b => (
                       <option key={b} value={b}>{b}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">POS Tipi</label>
                   <div className="grid grid-cols-2 gap-3">
                     {(["PHYSICAL","VIRTUAL"] as const).map(t => (
                       <button key={t} onClick={() => setGlobalPosType(t)}
                         className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${globalPosType===t ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}>
                         {t === "PHYSICAL" ? "Fiziksel POS" : "Sanal POS"}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>

               {/* Anlaşma Tipi */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button onClick={() => setGlobalPosAgreementType("COMMISSION")}
                   className={`py-4 px-5 rounded-xl text-sm font-bold border flex flex-col items-center gap-1.5 transition-all ${globalPosAgreementType === "COMMISSION" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}>
                   <span>Komisyon Kesintili POS</span>
                   <span className={`text-xs font-normal ${globalPosAgreementType === "COMMISSION" ? "text-blue-100" : "text-slate-400"}`}>Taksit bazında % oran + bloke</span>
                 </button>
                 <button onClick={() => setGlobalPosAgreementType("MONTHLY_FEE")}
                   className={`py-4 px-5 rounded-xl text-sm font-bold border flex flex-col items-center gap-1.5 transition-all ${globalPosAgreementType === "MONTHLY_FEE" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}>
                   <span>Aylık Sabit Aidatlı POS</span>
                   <span className={`text-xs font-normal ${globalPosAgreementType === "MONTHLY_FEE" ? "text-blue-100" : "text-slate-400"}`}>Sabit aidat + kısa bloke</span>
                 </button>
               </div>

               {globalPosAgreementType === "COMMISSION" ? (
                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                   <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Taksit Bazlı Komisyon Oranları</h5>
                   <div className="space-y-3">
                     {posInstallments.map((inst, idx) => (
                       <div key={idx} className="grid grid-cols-2 gap-4 items-center">
                         <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">{inst.count === "1" ? "Tek Çekim" : `${inst.count} Taksit`}</div>
                         <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                           <input type="number" step="0.1" value={inst.rate}
                             onChange={e => setPosInstallments(posInstallments.map((p,i) => i===idx ? {...p, rate: e.target.value} : p))}
                             className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="mt-4">
                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Para Bloke (Vade) Süresi</label>
                     <div className="relative max-w-xs">
                       <input type="number" value={globalPosBlockingDays} onChange={e => setGlobalPosBlockingDays(e.target.value)}
                         className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all" />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Gün</span>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Aylık Sabit Aidat (₺)</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                         <input type="number" value={globalPosMonthlyFee} onChange={e => setGlobalPosMonthlyFee(e.target.value)}
                           className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">BSMV/Kısa Bloke Süresi (Gün)</label>
                       <div className="relative">
                         <input type="number" value={globalPosMonthlyBlockingDays} onChange={e => setGlobalPosMonthlyBlockingDays(e.target.value)}
                           className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Gün</span>
                       </div>
                       <p className="text-[11px] text-slate-400 mt-1">Aylık aidatlı POS'larda bile BSMV blokesi uygulanabilir.</p>
                     </div>
                   </div>
                 </div>
               )}

               <div className="flex justify-end">
                 <button onClick={() => showToast("POS ayarları başarıyla kaydedildi!")}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                   Değişiklikleri Kaydet
                 </button>
               </div>
             </div>
             
           </div>
        </div>
      )}


            {/* TAX TAB */}
      {activeTab === "TAX" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Enhanced Header & Upcoming Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50 dark:from-[#1E293B] dark:to-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 flex items-center justify-center shadow-inner">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Vergi Yönetimi</h2>
                    <p className="text-sm text-slate-500 font-medium">Profesyonel Vergi ve Beyanname Takibi</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-4 max-w-md leading-relaxed">
                  Tüm KDV, Stopaj, Muhtasar ve Kurumlar Vergisi ödemelerinizi tek bir ekrandan takip edin, geçmiş ödemelerinizi analiz edin.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => { setEditingTaxItem(null); setTaxFormData({ type: "KDV", period: "", amount: "", dueDate: "", notes: "" }); setIsTaxFormOpen(true); }}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-[0_8px_16px_-6px_rgba(217,119,6,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(217,119,6,0.5)] hover:-translate-y-0.5">
                  <Plus className="w-5 h-5" /> Yeni Vergi Kaydı
                </button>
              </div>
            </div>

            {/* Smart Tax Calendar Widget */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Vergi Takvimi</h3>
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase leading-none">AYIN</span>
                    <span className="text-sm font-black leading-none mt-0.5">28</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-blue-100">KDV Beyannamesi</p>
                    <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-0.5">Son Ödeme Günü</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase leading-none">AYIN</span>
                    <span className="text-sm font-black leading-none mt-0.5">26</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-emerald-100">Muhtasar & SGK</p>
                    <p className="text-xs text-slate-500 dark:text-emerald-200/70 mt-0.5">Son Ödeme Günü</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Analytics Cards (Bento Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {["KDV","MUHTASAR","GELIR_VERGISI","KURUMLAR_VERGISI"].map((type, idx) => {
              const total = taxRecords.filter(r=>r.type===type).reduce((s,r)=>s+r.amount,0);
              const unpaid = taxRecords.filter(r=>r.type===type&&!r.isPaid).reduce((s,r)=>s+r.amount,0);
              const colors = ["text-blue-500 bg-blue-500/10", "text-purple-500 bg-purple-500/10", "text-emerald-500 bg-emerald-500/10", "text-rose-500 bg-rose-500/10"];
              
              return (
                <div key={type} className="group bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-slate-100 dark:to-slate-800 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[idx%4]}`}>
                      <PieChartIcon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{TAX_TYPE_LABELS[type]?.split(" ")[0]}</p>
                  </div>
                  
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">{total.toLocaleString("tr-TR")} ₺</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Ödenmemiş</span>
                    <span className={`text-xs font-bold ${unpaid > 0 ? "text-rose-500" : "text-emerald-500"}`}>{unpaid.toLocaleString("tr-TR")} ₺</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tax Records Interactive List */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Vergi Kayıtları</h3>
            </div>
            
            <div className="p-3">
              <div className="space-y-2">
                {taxRecords.map(record => (
                  <div key={record.id} className={`group relative p-4 rounded-2xl border transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center gap-4 ${record.isPaid ? "bg-slate-50 dark:bg-slate-900/50 border-transparent" : "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700"}`}>
                    
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${record.isPaid ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "bg-amber-100 dark:bg-amber-500/20 text-amber-600"}`}>
                      {record.isPaid ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">{TAX_TYPE_LABELS[record.type] || record.type}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{record.period}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${record.isPaid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}>
                          {record.isPaid ? "ÖDENDİ" : "BEKLİYOR"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Son Ödeme: {record.dueDate ? new Date(record.dueDate).toLocaleDateString("tr-TR") : "Belirtilmedi"}</span>
                        {record.notes && <span className="flex items-center gap-1.5 text-slate-400 truncate max-w-[200px]"><FileText className="w-3.5 h-3.5" /> {record.notes}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:ml-auto">
                      <span className={`font-black font-mono text-xl whitespace-nowrap ${record.isPaid ? "text-slate-400 dark:text-slate-500 line-through decoration-emerald-500/50" : "text-slate-900 dark:text-white"}`}>
                        {record.amount.toLocaleString("tr-TR")} ₺
                      </span>
                      
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                      
                      <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            const newRecords = taxRecords.map(r => r.id===record.id ? {...r, isPaid: !r.isPaid} : r);
                            setTaxRecords(newRecords);
                            saveTaxToDb(newRecords);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${record.isPaid ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}>
                          {record.isPaid ? "Geri Al" : "Ödendi"}
                        </button>
                        
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingTaxItem(record); setTaxFormData({ type: record.type, period: record.period, amount: record.amount.toString(), dueDate: record.dueDate, notes: record.notes }); setIsTaxFormOpen(true); }}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                              const newRecords = taxRecords.filter(r=>r.id!==record.id);
                              setTaxRecords(newRecords);
                              saveTaxToDb(newRecords);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {taxRecords.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="text-slate-900 dark:text-white font-bold mb-1">Vergi Kaydı Bulunamadı</h4>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">Sisteme henüz bir vergi kaydı girmediniz. Yeni kayıt ekleyerek vergi ödemelerinizi takip etmeye başlayabilirsiniz.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      )}

      {/* TAX FORM MODAL */}
      {isTaxFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setIsTaxFormOpen(false)}>
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full p-8 shadow-2xl relative " onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsTaxFormOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-colors text-slate-500 border border-slate-200 dark:border-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-6">{editingTaxItem ? "Vergi Kaydını Düzenle" : "Yeni Vergi Kaydı"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Vergi Türü</label>
                <select value={taxFormData.type} onChange={e => setTaxFormData({...taxFormData, type: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer">
                  {Object.entries(TAX_TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Dönem</label>
                  <input type="text" placeholder="2026-07 veya 2026-Q1" value={taxFormData.period} onChange={e => setTaxFormData({...taxFormData, period: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tutar (₺)</label>
                  <input type="number" placeholder="0" value={taxFormData.amount} onChange={e => setTaxFormData({...taxFormData, amount: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Son Ödeme Tarihi</label>
                <input type="date" value={taxFormData.dueDate} onChange={e => setTaxFormData({...taxFormData, dueDate: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Not / Açıklama</label>
                <textarea rows={2} placeholder="Opsiyonel..." value={taxFormData.notes} onChange={e => setTaxFormData({...taxFormData, notes: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all resize-none" />
              </div>
            </div>
            <button onClick={handleSaveTaxRecord}
              className="w-full mt-6 py-4 rounded-xl text-white font-bold text-base bg-amber-600 hover:bg-amber-700 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* NEW RECORD DRAWER / SLIDE-OVER */}
      {isNewRecordOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-in fade-in" onClick={() => setIsNewRecordOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-slate-50 dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col ">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1E293B]">
               <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                   <Plus className="w-5 h-5" />
                 </div>
                 Yeni Finansal Kayıt
               </h3>
               <button onClick={() => setIsNewRecordOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-500 shadow-sm">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Type Switcher */}
              <div className="bg-white dark:bg-[#1E293B] p-1.5 rounded-2xl flex gap-1.5 border border-slate-200 dark:border-slate-800 shadow-sm">
                 <button 
                   onClick={() => setNewRecordType("INCOME")}
                   className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${newRecordType === "INCOME" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                 >Gelir / Tahsilat</button>
                 <button 
                   onClick={() => setNewRecordType("EXPENSE")}
                   className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${newRecordType === "EXPENSE" ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                 >Gider / Masraf</button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">İşlem Başlığı</label>
                  <input 
                    type="text" 
                    value={newRecordData.title}
                    onChange={(e) => setNewRecordData({...newRecordData, title: e.target.value})}
                    placeholder={newRecordType === "INCOME" ? "Ne sattık? (Örn: Çerçeve Satışı)" : "Ne aldık / Nereye ödedik? (Örn: Kira Ödemesi)"} 
                    className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tutar (KDV Dahil)</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₺</span>
                    <input 
                      type="number" 
                      value={newRecordData.amount}
                      onChange={(e) => setNewRecordData({...newRecordData, amount: e.target.value})}
                      placeholder="0.00" 
                      className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">KDV Oranı</label>
                    <div className="relative mb-2">
                      <select 
                        value={newRecordData.taxRate}
                        onChange={(e) => setNewRecordData({...newRecordData, taxRate: e.target.value})}
                        className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="20">%20 KDV</option>
                        <option value="10">%10 KDV</option>
                        <option value="1">%1 KDV</option>
                        <option value="0">KDV Yok (%0)</option>
                        <option value="CUSTOM">Kendim Gireceğim</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                    {newRecordData.taxRate === "CUSTOM" && (
                       <div className="relative animate-in fade-in slide-in-from-top-1">
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                         <input 
                           type="number" 
                           placeholder="Örn: 7" 
                           value={newRecordData.customTaxRate}
                           onChange={(e) => setNewRecordData({...newRecordData, customTaxRate: e.target.value})}
                           className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm" 
                         />
                       </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kategori</label>
                    <div className="relative">
                      <select className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none shadow-sm cursor-pointer">
                        {newRecordType === "INCOME" ? (
                          <>
                            <option>Ürün Satışı</option>
                            <option>Hizmet Bedeli</option>
                            <option>Danışmanlık Ücreti</option>
                            <option>Yatırım Getirisi</option>
                            <option>Diğer Gelirler</option>
                          </>
                        ) : (
                          <>
                            <option>Maaş & Personel Gideri</option>
                            <option>SGK Ödemesi</option>
                            <option>Vergi Ödemesi</option>
                            <option>Kira & Stopaj</option>
                            <option>Fatura (Elektrik/Su/İnternet)</option>
                            <option>Ürün Alımı (Maliyet)</option>
                            <option>Demirbaş Alımı</option>
                            <option>Sarf Malzeme</option>
                            <option>Pazarlama & Reklam</option>
                            <option>Diğer Giderler</option>
                          </>
                        )}
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ödeme Yöntemi</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Nakit", "Kredi Kartı", "Havale/EFT"].map(m => (
                      <button key={m} className={`border rounded-xl py-3 text-sm font-bold transition-all shadow-sm ${newRecordData.paymentMethod === m ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] hover:border-slate-300 text-slate-600 dark:text-slate-400'}`} onClick={() => setNewRecordData({...newRecordData, paymentMethod: m})}>
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* KREDİ KARTI / POS DETAYLARI */}
                  {newRecordData.paymentMethod === "Kredi Kartı" && (
                    <div className="bg-slate-100/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 mt-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-500" /> POS / Banka Anlaşması
                      </h4>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button 
                          onClick={() => setNewRecordData({...newRecordData, posAgreementType: "COMMISSION"})}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${newRecordData.posAgreementType === "COMMISSION" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}
                        >Komisyon Kesintili</button>
                        <button 
                          onClick={() => setNewRecordData({...newRecordData, posAgreementType: "MONTHLY_FEE"})}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${newRecordData.posAgreementType === "MONTHLY_FEE" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}
                        >Aylık Sabit Aidatlı</button>
                      </div>
                      
                      {newRecordData.posAgreementType === "COMMISSION" ? (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Komisyon Oranı (%)</label>
                            <input 
                               type="number" 
                               step="0.1" 
                               value={newRecordData.posCommissionRate} 
                               onChange={e => setNewRecordData({...newRecordData, posCommissionRate: e.target.value})} 
                               className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm" 
                            />
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Bloke Süresi (Gün)</label>
                             <input 
                               type="number" 
                               value={newRecordData.posBlockingDays} 
                               onChange={e => setNewRecordData({...newRecordData, posBlockingDays: e.target.value})} 
                               className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm" 
                             />
                          </div>
                        </div>
                      ) : (
                        <div className="animate-in fade-in slide-in-from-top-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Aylık Sabit POS Ücreti</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₺</span>
                            <input 
                               type="number" 
                               value={newRecordData.posMonthlyFee} 
                               onChange={e => setNewRecordData({...newRecordData, posMonthlyFee: e.target.value})} 
                               className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ek Açıklama / Not</label>
                  <textarea rows={2} placeholder="İşlem ile ilgili ekstra not (opsiyonel)..." className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none shadow-sm"></textarea>
                </div>

                <div className="p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                   <div className="flex justify-between items-center text-sm mb-2.5">
                     <span className="text-slate-500 font-medium">Brüt Tutar:</span>
                     <span className="font-bold text-slate-900 dark:text-white font-mono">{parsedAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
                   </div>

                   {posCommission > 0 && (
                     <div className="flex justify-between items-center text-sm mb-2.5">
                       <span className="text-slate-500 font-medium">Banka/POS Kesintisi (%{newRecordData.posCommissionRate}):</span>
                       <span className="font-bold text-rose-600 dark:text-rose-500 font-mono">- {posCommission.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
                     </div>
                   )}

                   <div className="flex justify-between items-center text-sm mb-4">
                     <span className="text-slate-500 font-medium">İç KDV Ayırması (%{currentTaxRate}):</span>
                     <span className="font-bold text-amber-600 dark:text-amber-500 font-mono">- {calculatedVat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
                   </div>
                   
                   <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <span className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">NET (Ele Geçen):</span>
                     <span className="font-black text-xl text-blue-600 dark:text-blue-400 font-mono">{netAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
                   </div>
                   
                   {newRecordData.paymentMethod === "Kredi Kartı" && newRecordData.posAgreementType === "COMMISSION" && (
                     <div className="mt-3 text-[10px] text-slate-400 text-right">
                       * Bu tutar ortalama {newRecordData.posBlockingDays} gün sonra hesabınıza geçecektir.
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
               <button className={`w-full py-4 rounded-xl text-white font-bold text-base transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 ${newRecordType === "INCOME" ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                 İşlemi Sisteme Kaydet
               </button>
            </div>
          </div>
        </>
      )}

      {/* TRANSACTION DETAILS MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedRecord(null)}>
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full p-8 shadow-2xl relative " onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedRecord(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-5 mb-8">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${selectedRecord.type === "INCOME" || selectedRecord.amount > 0 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-800"}`}>
                 {selectedRecord.type === "INCOME" || selectedRecord.amount > 0 ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
               </div>
               <div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedRecord.description}</h2>
                 <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                   <Calendar className="w-4 h-4" /> {new Date(selectedRecord.date).toLocaleDateString("tr-TR")}
                 </p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                 <span className="text-slate-500 font-bold text-sm">Brüt Tutar</span>
                 <span className="text-lg font-black font-mono text-slate-900 dark:text-white">{Math.abs(selectedRecord.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
               </div>
               
               <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                 <span className="text-slate-500 font-bold text-sm">Vergi / KDV Yükü</span>
                 <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-500">{selectedRecord.tax?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
               </div>
               
               <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                 <span className="text-slate-500 font-bold text-sm">Ödeme Yöntemi</span>
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> {selectedRecord.method}</span>
               </div>

               <div className={`p-5 rounded-2xl border flex justify-between items-center ${selectedRecord.calculatedProfit > 0 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20'}`}>
                 <span className="text-slate-700 dark:text-slate-300 font-bold uppercase text-xs tracking-wider">Net Kâr / Şirket Etkisi</span>
                 <span className={`text-2xl font-black font-mono ${selectedRecord.calculatedProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                   {selectedRecord.calculatedProfit > 0 ? "+" : ""}{selectedRecord.calculatedProfit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                 </span>
               </div>
            </div>
          </div>
        </div>
      )}
      {/* PLANNED ITEM MODAL */}
      {isPlannedFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setIsPlannedFormOpen(false)}>
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full p-8 shadow-2xl relative " onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsPlannedFormOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <div className={`p-3 rounded-xl ${plannedFormType === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                {plannedFormType === 'INCOME' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              {editingPlannedItem ? "Planlı Öğeyi Düzenle" : "Yeni Planlı Öğe"}
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Başlık (Açıklama)</label>
                <input 
                  type="text" 
                  value={plannedFormData.title}
                  onChange={e => setPlannedFormData({...plannedFormData, title: e.target.value})}
                  placeholder="Örn: Ofis Kirası"
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tutar (₺)</label>
                <input 
                  type="number" 
                  value={plannedFormData.amount}
                  onChange={e => setPlannedFormData({...plannedFormData, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Başlangıç Tarihi</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="date" 
                      value={plannedFormData.startDate}
                      onChange={e => setPlannedFormData({...plannedFormData, startDate: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bitiş Tarihi</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="date" 
                      value={plannedFormData.endDate}
                      onChange={e => setPlannedFormData({...plannedFormData, endDate: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Not / Açıklama</label>
                <textarea 
                  rows={2}
                  value={plannedFormData.notes}
                  onChange={e => setPlannedFormData({...plannedFormData, notes: e.target.value})}
                  placeholder="Opsiyonel detay..."
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={handleSavePlannedForm}
                className={`w-full py-4 rounded-xl text-white font-bold text-base transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 ${plannedFormType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setConfirmationModal({...confirmationModal, isOpen: false})}>
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-sm w-full p-8 shadow-2xl relative  text-center" onClick={e => e.stopPropagation()}>
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm border ${confirmationModal.actionType === "PAY" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-800"}`}>
              {confirmationModal.actionType === "PAY" ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              İşlemi Onaylıyor musunuz?
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              {confirmationModal.actionType === "PAY" 
                ? (confirmationModal.type === "INCOME" ? "Bu planlı tahsilatı 'Alındı' olarak işaretlemek üzeresiniz." : "Bu planlı ödemeyi 'Yapıldı' olarak işaretlemek üzeresiniz.")
                : (confirmationModal.type === "INCOME" ? "Bu tahsilatın alındı bilgisini geri alacaksınız." : "Bu ödemenin yapıldı bilgisini geri alacaksınız.")}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmationModal({...confirmationModal, isOpen: false})}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Vazgeç
              </button>
              <button 
                onClick={confirmTogglePaid}
                className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 ${confirmationModal.actionType === "PAY" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}`}
              >
                Evet, Onayla
              </button>
            </div>
          </div>
        </div>
      )}

            {debtPaymentModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setDebtPaymentModal({...debtPaymentModal, isOpen: false})}>
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-sm w-full p-8 shadow-2xl relative " onClick={e => e.stopPropagation()}>
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

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

    </>
  );
}
