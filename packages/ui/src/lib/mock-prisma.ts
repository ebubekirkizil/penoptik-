// In-memory mock database for Demo Module
let customers = [
  {
    id: "cus_1",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    phone: "05321112233",
    email: "ahmet@example.com",
    tcNo: "12345678901",
    address: "Kadıköy, İstanbul",
    diseases: "Göz Tansiyonu",
    notes: "VIP Müşteri",
    hasLoggedBefore: true,
    createdAt: new Date("2024-01-10T10:00:00Z"),
    updatedAt: new Date("2024-01-10T10:00:00Z"),
    opticOrders: [
      { id: "ord_1", status: "READY", createdAt: new Date("2024-02-15T14:30:00Z") }
    ],
    prescriptions: [{ id: "rx_1" }],
    _count: { opticOrders: 1, prescriptions: 1 }
  },
  {
    id: "cus_2",
    firstName: "Ayşe",
    lastName: "Kaya",
    phone: "05332223344",
    email: "ayse@example.com",
    tcNo: "22345678901",
    address: "Beşiktaş, İstanbul",
    diseases: "",
    notes: "",
    hasLoggedBefore: false,
    createdAt: new Date("2024-03-20T09:15:00Z"),
    updatedAt: new Date("2024-03-20T09:15:00Z"),
    opticOrders: [
      { id: "ord_2", status: "DELIVERED", createdAt: new Date("2024-03-25T11:20:00Z") }
    ],
    prescriptions: [{ id: "rx_2" }],
    _count: { opticOrders: 1, prescriptions: 1 }
  }
];

let opticOrders = [
  {
    id: "ord_1",
    customerId: "cus_1",
    status: "READY",
    products: "Varilux Comfort Max",
    productCode: "VRX-MAX",
    totalPrice: 4500,
    deposit: 2000,
    balance: 2500,
    orderDate: new Date("2024-02-15T14:30:00Z"),
    deliveryDate: new Date("2024-02-20T14:30:00Z"),
    createdAt: new Date("2024-02-15T14:30:00Z"),
    customer: customers[0],
    installments: []
  },
  {
    id: "ord_2",
    customerId: "cus_2",
    status: "DELIVERED",
    products: "Zeiss SmartLife",
    productCode: "ZS-LF",
    totalPrice: 6200,
    deposit: 6200,
    balance: 0,
    orderDate: new Date("2024-03-25T11:20:00Z"),
    deliveryDate: new Date("2024-03-30T11:20:00Z"),
    createdAt: new Date("2024-03-25T11:20:00Z"),
    customer: customers[1],
    installments: []
  }
];

let prescriptions = [
  {
    id: "rx_1",
    customerId: "cus_1",
    farRightSph: "-1.50",
    farRightCyl: "-0.50",
    farLeftSph: "-1.25",
    farLeftCyl: "-0.25",
    lensType: "Uzak",
    createdAt: new Date("2024-02-15T14:00:00Z"),
    customer: customers[0]
  },
  {
    id: "rx_2",
    customerId: "cus_2",
    nearRightSph: "+2.00",
    nearLeftSph: "+2.25",
    lensType: "Yakın",
    createdAt: new Date("2024-03-25T11:00:00Z"),
    customer: customers[1]
  }
];

let installments: any[] = [];
let customerVerifications: any[] = [];
let activityLogs: any[] = [];
let products: any[] = [
  { id: "prod_1", name: "Buz Mavisi Kırmızı Çerçeve", barcode: "8691234567890", costPrice: 3000, sellingPrice: 10000, stockQuantity: 50, taxRate: 20 },
  { id: "prod_2", name: "Varilux Comfort Max", barcode: "VRX-MAX-01", costPrice: 2000, sellingPrice: 4500, stockQuantity: 20, taxRate: 20 },
  { id: "prod_3", name: "Zeiss SmartLife", barcode: "ZS-LF-01", costPrice: 3500, sellingPrice: 6200, stockQuantity: 15, taxRate: 20 }
];
let financeRecords: any[] = [
  { id: "fin_1", type: "INCOME", amount: 4500, cost: 2000, tax: 416.67, netProfit: 2083.33, description: "Satış: Varilux Comfort Max", date: new Date("2024-02-15T14:30:00Z") }
];
let ecommerceOrders: any[] = [];

export const prisma = {
  customer: {
    findMany: async (...args: any[]) => customers,
    findUnique: async ({ where }: any) => customers.find(c => c.id === where.id),
    findFirst: async ({ where }: any) => customers.find(c => c.id === where.id) || customers[0],
    count: async (...args: any[]) => customers.length,
    create: async ({ data }: any) => {
      const newCus = { ...data, id: "cus_" + Date.now(), createdAt: new Date(), opticOrders: [], prescriptions: [], _count: { opticOrders: 0, prescriptions: 0 } };
      customers.push(newCus);
      return newCus;
    },
    createMany: async (...args: any[]) => ({ count: 0 }),
    updateMany: async (...args: any[]) => ({ count: 0 }),
    deleteMany: async (...args: any[]) => ({ count: 0 }),
    update: async (...args: any[]) => {
      const [{ where, data }] = args;
      const idx = customers.findIndex(c => c.id === where.id);
      if (idx > -1) {
        customers[idx] = { ...customers[idx], ...data };
        return customers[idx];
      }
      return customers[0];
    }
  },
  opticOrder: {
    findMany: async (...args: any[]) => opticOrders,
    findUnique: async ({ where }: any) => opticOrders.find(o => o.id === where.id),
    findFirst: async ({ where }: any) => opticOrders.find(o => o.id === where.id) || opticOrders[0],
    count: async (...args: any[]) => opticOrders.length,
    groupBy: async (...args: any[]) => [
      { status: "READY", _count: 1 },
      { status: "DELIVERED", _count: 1 }
    ],
    create: async ({ data }: any) => {
      const newOrd = { ...data, id: "ord_" + Date.now(), createdAt: new Date(), customer: customers[0], installments: [] };
      opticOrders.push(newOrd);
      return newOrd;
    },
    createMany: async (...args: any[]) => ({ count: 0 }),
    updateMany: async (...args: any[]) => ({ count: 0 }),
    deleteMany: async (...args: any[]) => ({ count: 0 }),
    update: async (...args: any[]) => {
      const [{ where, data }] = args;
      const idx = opticOrders.findIndex(o => o.id === where.id);
      if (idx > -1) {
        opticOrders[idx] = { ...opticOrders[idx], ...data };
        return opticOrders[idx];
      }
      return opticOrders[0];
    }
  },
  prescription: {
    findMany: async (...args: any[]) => prescriptions,
    findUnique: async ({ where }: any) => prescriptions.find(p => p.id === where.id),
    findFirst: async ({ where }: any) => prescriptions.find(p => p.id === where.id) || prescriptions[0],
    count: async (...args: any[]) => prescriptions.length,
    create: async ({ data }: any) => {
      const newRx = { ...data, id: "rx_" + Date.now(), createdAt: new Date(), customer: customers.find(c => c.id === data.customerId) || customers[0] };
      prescriptions.push(newRx);
      return newRx;
    },
    createMany: async (...args: any[]) => ({ count: 0 }),
    updateMany: async (...args: any[]) => ({ count: 0 }),
    deleteMany: async (...args: any[]) => ({ count: 0 }),
    delete: async (...args: any[]) => prescriptions[0],
    update: async (...args: any[]) => prescriptions[0],
  },
  installment: {
    findMany: async (...args: any[]) => installments,
    findUnique: async (...args: any[]) => installments[0] || { id: "inst_1", amount: 100, isPaid: false, paymentDate: new Date() },
    findFirst: async (...args: any[]) => installments[0] || { id: "inst_1", amount: 100, isPaid: false, paymentDate: new Date() },
    count: async (...args: any[]) => installments.length,
    create: async (...args: any[]) => installments[0] || {},
    createMany: async (...args: any[]) => ({ count: 0 }),
    updateMany: async (...args: any[]) => ({ count: 0 }),
    deleteMany: async (...args: any[]) => ({ count: 0 }),
    update: async (...args: any[]) => installments[0] || {},
    delete: async (...args: any[]) => installments[0] || {},
  },
  customerVerification: {
    findMany: async (...args: any[]) => customerVerifications,
    findUnique: async (...args: any[]) => customerVerifications[0] || { id: "verify_1", status: "PENDING" },
    findFirst: async (...args: any[]) => customerVerifications[0] || { id: "verify_1", status: "PENDING" },
    count: async (...args: any[]) => customerVerifications.length,
    create: async (...args: any[]) => customerVerifications[0] || {},
    update: async (...args: any[]) => customerVerifications[0] || {},
    delete: async (...args: any[]) => customerVerifications[0] || {},
  },
  settings: {
    findUnique: async () => ({ id: "global", subscriptionPlan: "Demo Paket", subscriptionStatus: "Aktif" }),
    findFirst: async () => ({ id: "global", subscriptionPlan: "Demo Paket", subscriptionStatus: "Aktif" }),
    update: async (...args: any[]) => ({ id: "global", subscriptionPlan: "Demo Paket", subscriptionStatus: "Aktif" }),
  },
  activityLog: {
    findMany: async (...args: any[]) => activityLogs,
    findUnique: async (...args: any[]) => activityLogs[0] || { id: "log_1" },
    findFirst: async (...args: any[]) => activityLogs[0] || { id: "log_1" },
    count: async (...args: any[]) => activityLogs.length,
    create: async (...args: any[]) => activityLogs[0] || {},
  },
  firm: {
    findFirst: async () => ({ id: "demo_firm", name: "Demo Optik", package: { price: 0 } }),
    findUnique: async () => ({ id: "demo_firm", name: "Demo Optik", package: { price: 0 } }),
  },
  product: {
    findMany: async (...args: any[]) => products,
    findUnique: async ({ where }: any) => products.find(p => p.id === where.id || p.barcode === where.barcode) || products[0],
    findFirst: async ({ where }: any) => products.find(p => p.id === where.id || p.barcode === where.barcode) || products[0],
    update: async (...args: any[]) => {
      const [{ where, data }] = args;
      const idx = products.findIndex(p => p.id === where.id);
      if (idx > -1) {
        products[idx] = { ...products[idx], ...data };
        return products[idx];
      }
      return products[0];
    }
  },
  financeRecord: {
    findMany: async (...args: any[]) => financeRecords,
    create: async ({ data }: any) => {
      const newRec = { ...data, id: "fin_" + Date.now(), date: new Date() };
      financeRecords.push(newRec);
      return newRec;
    }
  },
  order: { // For ecommerce orders
    findMany: async (...args: any[]) => ecommerceOrders,
    findUnique: async (...args: any[]) => ecommerceOrders[0] || { id: "eco_1", status: "PENDING" },
    findFirst: async (...args: any[]) => ecommerceOrders[0] || { id: "eco_1", status: "PENDING" },
  }
};
