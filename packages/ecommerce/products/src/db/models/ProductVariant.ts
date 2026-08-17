// packages/ecommerce/products/src/db/models/ProductVariant.ts

import { UUID } from 'crypto'; // Assuming a UUID type or similar

/**
 * @interface IProductVariant
 * Represents the structure of a product variant in the database.
 */
export interface IProductVariant {
  id: UUID;
  product_id: UUID;
  sku: string;
  barcode?: string;
  price_modifier: number; // Storing as number for now, careful with precision
  stock_quantity: number;
  attributes: Record<string, string>; // e.g., { "color": "Red", "size": "M" }
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// In a real application, this would integrate with an ORM (e.g., Prisma, TypeORM).
// For example, using Prisma:
/*
model ProductVariant {
  id              String    @id @default(uuid()) @map("_id")
  product_id      String
  sku             String    @unique
  barcode         String?
  price_modifier  Decimal   @db.Decimal(10, 2) @default(0.00)
  stock_quantity  Int       @default(0)
  attributes      Json // Stores variant-specific attributes as JSON
  is_active       Boolean   @default(true)

  product         Product   @relation(fields: [product_id], references: [id])
  images          ProductImage[]

  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@map("product_variants")
}
*/
