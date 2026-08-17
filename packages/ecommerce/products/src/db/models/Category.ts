// packages/ecommerce/products/src/db/models/Category.ts

import { UUID } from 'crypto'; // Assuming a UUID type or similar

/**
 * @interface ICategory
 * Represents the structure of a product category in the database.
 */
export interface ICategory {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  parent_id?: UUID; // For hierarchical categories
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// In a real application, this would integrate with an ORM (e.g., Prisma, TypeORM).
// For example, using Prisma:
/*
model Category {
  id        String    @id @default(uuid()) @map("_id")
  name      String
  slug      String    @unique
  description String?
  parent_id String?
  is_active Boolean   @default(true)

  products  Product[]
  children  Category[] @relation("ParentChildCategories", fields: [parent_id], references: [id])
  parent    Category?  @relation("ParentChildCategories", fields: [parent_id], references: [id])

  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt

  @@map("categories")
}
*/
