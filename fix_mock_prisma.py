import sys

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/lib/mock-prisma.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_customer = """  customer: {
    findUnique: async (_args?: any) => null,
    findMany: async (_args?: any) => [],"""

new_customer = """  customer: {
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
    findMany: async (_args?: any) => [],"""

if old_customer in content:
    content = content.replace(old_customer, new_customer)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Mock customer findUnique added!")
else:
    print("String not found!")
