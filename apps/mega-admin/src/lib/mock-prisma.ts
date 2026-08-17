// Mock Prisma client for demo mode — no real database connection needed
// This satisfies all `import { prisma } from "@/lib/mock-prisma"` calls in demo pages

const mockSettings = {
  id: "global",
  themeData: null,
  siteName: "Pen Optik Demo",
  siteDescription: "Demo optik yönetim paneli",
};

export const prisma = {
  settings: {
    findUnique: async (_args?: any) => mockSettings,
    upsert: async (_args?: any) => mockSettings,
    update: async (_args?: any) => mockSettings,
  },
  user: {
    findUnique: async (_args?: any) => null,
    findMany: async (_args?: any) => [],
    create: async (args?: any) => args?.data || null,
    update: async (_args?: any) => null,
    delete: async (_args?: any) => null,
    count: async (_args?: any) => 0,
  },
  customer: {
    findUnique: async (args?: any) => {
      const id = args?.where?.id || "mock-id";
      return {
        id,
        firstName: id === "CUST-002" ? "Ahmet" : "Zeynep",
        lastName: id === "CUST-002" ? "Yılmaz" : "Kaya",
        phone: "0555 555 5555",
        email: "demo@example.com",
        tcNo: "12345678901",
        birthDate: new Date(),
        createdAt: new Date(),
        prescriptions: [],
        opticOrders: []
      };
    },
    findMany: async (_args?: any) => [],
    create: async (args?: any) => args?.data || null,
    update: async (_args?: any) => null,
    delete: async (_args?: any) => null,
    count: async (_args?: any) => 0,
  },
  order: {
    findUnique: async (_args?: any) => null,
    findMany: async (_args?: any) => [],
    create: async (args?: any) => args?.data || null,
    update: async (_args?: any) => null,
    delete: async (_args?: any) => null,
    count: async (_args?: any) => 0,
  },
  prescription: {
    findUnique: async (_args?: any) => null,
    findMany: async (_args?: any) => [],
    create: async (args?: any) => args?.data || null,
    update: async (_args?: any) => null,
    delete: async (_args?: any) => null,
    count: async (_args?: any) => 0,
  },
  product: {
    findUnique: async (_args?: any) => null,
    findMany: async (_args?: any) => [],
    create: async (args?: any) => args?.data || null,
    update: async (_args?: any) => null,
    delete: async (_args?: any) => null,
    count: async (_args?: any) => 0,
  },
  installment: {
    findUnique: async (_args?: any) => null,
    findMany: async (_args?: any) => [],
    create: async (args?: any) => args?.data || null,
    update: async (_args?: any) => null,
    delete: async (_args?: any) => null,
  },
  activityLog: {
    findMany: async (_args?: any) => [],
    create: async (_args?: any) => null,
  },
  trashItem: {
    findMany: async (_args?: any) => [],
    create: async (_args?: any) => null,
    delete: async (_args?: any) => null,
    deleteMany: async (_args?: any) => null,
  },
  $transaction: async (fns: any[]) => Promise.all(fns.map(fn => typeof fn === 'function' ? fn(prisma) : fn)),
  $disconnect: async () => {},
};
