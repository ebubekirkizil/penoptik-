// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { encrypt, decrypt, createBlindIndex } from "./crypto";

export * from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL environment variable is missing in production!");
  }
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prismaFresh: PrismaClient | undefined;
};

const basePrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

function decryptCustomerInPlace(customer: any) {
  if (!customer || typeof customer !== 'object') return;
  
  const fieldsToDecrypt = [
    'firstName', 'lastName', 'phone', 'tcNo', 
    'address', 'email', 'diseases', 'notes'
  ];
  
  for (const field of fieldsToDecrypt) {
    if (customer[field] && typeof customer[field] === 'string') {
       // Sadece kriptolu formatta ise (içinde ':' olan ve 3 parça olan) çözmeyi dene.
       if (customer[field].split(':').length === 3) {
          customer[field] = decrypt(customer[field]) ?? customer[field];
       }
    }
  }
}

function deeplyDecryptCustomers(data: any): any {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      deeplyDecryptCustomers(data[i]);
    }
    return data;
  }
  
  if (data instanceof Date) return data;
  if (Buffer.isBuffer(data)) return data;

  if (typeof data === 'object') {
    // Heuristic: If it has firstName and lastName or phone, it's highly likely to be a customer
    // The strict 3-part check during decryption ensures we don't accidentally ruin non-encrypted text
    if (('firstName' in data) || ('lastName' in data) || ('phone' in data)) {
      decryptCustomerInPlace(data);
    }
    
    // Deep traverse for includes
    for (const key in data) {
      const val = data[key];
      // Yalnızca düz nesneler veya diziler için özyineleme (recursion) yap, Date/Buffer için atla
      if (val !== null && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
        deeplyDecryptCustomers(val);
      }
    }
    return data;
  }
  
  return data;
}

// Prisma Extension for Application-Level Encryption using query intercepts instead of result intercepts
// to avoid select/include bugs and silently failing decryption logic.
export const prisma = basePrisma.$extends({
  query: {
    customer: {
      async create({ args, query }) {
        if (args.data) {
          if (args.data.firstName) {
            args.data.firstNameHash = createBlindIndex(args.data.firstName) ?? undefined;
            args.data.firstName = encrypt(args.data.firstName) ?? args.data.firstName;
          }
          if (args.data.lastName) {
            args.data.lastNameHash = createBlindIndex(args.data.lastName) ?? undefined;
            args.data.lastName = encrypt(args.data.lastName) ?? args.data.lastName;
          }
          if (args.data.phone) {
            args.data.phoneHash = createBlindIndex(args.data.phone) ?? undefined;
            args.data.phone = encrypt(args.data.phone) ?? args.data.phone;
          }
          if (args.data.tcNo) {
            args.data.tcNoHash = createBlindIndex(args.data.tcNo) ?? undefined;
            args.data.tcNo = encrypt(args.data.tcNo) ?? args.data.tcNo;
          }
          if (args.data.address) args.data.address = encrypt(args.data.address) ?? args.data.address;
          if (args.data.email) args.data.email = encrypt(args.data.email) ?? args.data.email;
          if (args.data.diseases) args.data.diseases = encrypt(args.data.diseases) ?? args.data.diseases;
          if (args.data.notes) args.data.notes = encrypt(args.data.notes) ?? args.data.notes;
        }
        // Result intercepts are handled globally below
        return query(args);
      },
      async update({ args, query }) {
        if (args.data) {
          if (typeof args.data.firstName === 'string') {
            args.data.firstNameHash = createBlindIndex(args.data.firstName) ?? undefined;
            args.data.firstName = encrypt(args.data.firstName) ?? args.data.firstName;
          }
          if (typeof args.data.lastName === 'string') {
            args.data.lastNameHash = createBlindIndex(args.data.lastName) ?? undefined;
            args.data.lastName = encrypt(args.data.lastName) ?? args.data.lastName;
          }
          if (typeof args.data.phone === 'string') {
            args.data.phoneHash = createBlindIndex(args.data.phone) ?? undefined;
            args.data.phone = encrypt(args.data.phone) ?? args.data.phone;
          }
          if (typeof args.data.tcNo === 'string') {
            args.data.tcNoHash = createBlindIndex(args.data.tcNo) ?? undefined;
            args.data.tcNo = encrypt(args.data.tcNo) ?? args.data.tcNo;
          }
          if (typeof args.data.address === 'string') args.data.address = encrypt(args.data.address) ?? args.data.address;
          if (typeof args.data.email === 'string') args.data.email = encrypt(args.data.email) ?? args.data.email;
          if (typeof args.data.diseases === 'string') args.data.diseases = encrypt(args.data.diseases) ?? args.data.diseases;
          if (typeof args.data.notes === 'string') args.data.notes = encrypt(args.data.notes) ?? args.data.notes;
        }
        return query(args);
      }
    },
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const res = await query(args);
        // Automatically decrypt ALL results, whether it's a list or an object, and nested includes!
        return deeplyDecryptCustomers(res);
      }
    }
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaFresh = prisma;
