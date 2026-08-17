// packages/ecommerce/products/src/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { IProduct } from '../../db/models/Product';
import { UUID } from 'crypto';

// Placeholder for a simple in-memory store for demonstration
const products: IProduct[] = [];

/**
 * @method GET
 * @route /api/products
 * @description Get all products (with optional filtering/pagination)
 * @returns {NextResponse<IProduct[]>} A list of products
 */
export async function GET(req: NextRequest) {
  // In a real application, this would fetch from a database using an ORM.
  // Example: const products = await db.product.findMany();

  // For demonstration, returning all in-memory products
  return NextResponse.json(products);
}

/**
 * @method POST
 * @route /api/products
 * @description Create a new product
 * @param {NextRequest} req - The request object containing the product data.
 * @returns {NextResponse<IProduct>} The created product.
 */
export async function POST(req: NextRequest) {
  try {
    const newProductData: Omit<IProduct, 'id' | 'created_at' | 'updated_at'> = await req.json();
    const newProduct: IProduct = {
      id: '' as UUID, // Placeholder UUID generation
      ...newProductData,
      is_active: newProductData.is_active ?? true,
      is_featured: newProductData.is_featured ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    products.push(newProduct); // Add to in-memory store

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create product', error: error.message }, { status: 500 });
  }
}
