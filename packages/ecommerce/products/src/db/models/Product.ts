// packages/ecommerce/products/src/db/models/Product.ts

import { UUID } from 'crypto'; // Assuming a UUID type or similar

/**
 * @interface IProduct
 * Represents the structure of a product in the database.
 */
export interface IProduct {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number; // Storing as number for now, careful with precision
  currency: string;
  sku?: string;
  is_active: boolean;
  is_featured: boolean;
  category_id: UUID;
  brand_id?: UUID; // Assuming a Brands module later
  created_at: Date;
  updated_at: Date;
}

// In a real application, this would integrate with an ORM (e.g., Prisma, TypeORM).
// For example, using Prisma:
/*
model Product {
  id              String    @id @default(uuid()) @map("_id")
  name            String
  slug            String    @unique
  description     String?
  short_description String?
  price           Decimal   @db.Decimal(10, 2)
  currency        String
  sku             String?   @unique
  is_active       Boolean   @default(true)
  is_featured     Boolean   @default(false)
  category_id     String
  brand_id        String?

  category        Category  @relation(fields: [category_id], references: [id])
  variants        ProductVariant[]
  images          ProductImage[]

  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@map("products")
}
*/
