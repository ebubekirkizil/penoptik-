// packages/ecommerce/products/src/db/models/ProductImage.ts

import { UUID } from 'crypto'; // Assuming a UUID type or similar

/**
 * @interface IProductImage
 * Represents the structure of a product image in the database.
 */
export interface IProductImage {
  id: UUID;
  product_id: UUID;
  image_url: string;
  thumbnail_url?: string;
  alt_text?: string;
  sort_order: number;
  is_main: boolean;
  variant_id?: UUID; // Optional: if the image is specific to a variant
  created_at: Date;
  updated_at: Date;
}

// In a real application, this would integrate with an ORM (e.g., Prisma, TypeORM).
// For example, using Prisma:
/*
model ProductImage {
  id           String    @id @default(uuid()) @map("_id")
  product_id   String
  image_url    String
  thumbnail_url String?
  alt_text     String?
  sort_order   Int       @default(0)
  is_main      Boolean   @default(false)
  variant_id   String?

  product      Product   @relation(fields: [product_id], references: [id])
  variant      ProductVariant? @relation(fields: [variant_id], references: [id])

  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  @@map("product_images")
}
*/
