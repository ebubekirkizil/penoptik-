// packages/ecommerce/products/src/api/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { IProduct } from '../../../db/models/Product';
import { UUID } from 'crypto';

// Placeholder for a simple in-memory store for demonstration
// In a real app, this would be an ORM interaction
const products: IProduct[] = []; // Re-initialize or import from a shared mock store if available

/**
 * @method GET
 * @route /api/products/[id]
 * @description Get a single product by ID
 * @param {NextRequest} req - The request object.
 * @param {{ params: { id: UUID } }} { params } - The path parameters containing the product ID.
 * @returns {NextResponse<IProduct | { message: string }>} The product or an error message.
 */
export async function GET(req: NextRequest, { params }: { params: { id: UUID } }) {
  // Example: const product = await db.product.findUnique({ where: { id: params.id } });
  const product = products.find(p => p.id === params.id);

  if (product) {
    return NextResponse.json(product);
  } else {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
}

/**
 * @method PUT
 * @route /api/products/[id]
 * @description Update an existing product by ID
 * @param {NextRequest} req - The request object containing the updated product data.
 * @param {{ params: { id: UUID } }} { params } - The path parameters containing the product ID.
 * @returns {NextResponse<IProduct | { message: string }>} The updated product or an error message.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: UUID } }) {
  try {
    const updatedData: Partial<IProduct> = await req.json();
    const productIndex = products.findIndex(p => p.id === params.id);

    if (productIndex !== -1) {
      products[productIndex] = { ...products[productIndex], ...updatedData, updated_at: new Date() };
      return NextResponse.json(products[productIndex]);
    } else {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update product', error: error.message }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @route /api/products/[id]
 * @description Delete a product by ID
 * @param {NextRequest} req - The request object.
 * @param {{ params: { id: UUID } }} { params } - The path parameters containing the product ID.
 * @returns {NextResponse<{ message: string }>}
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: UUID } }) {
  const productIndex = products.findIndex(p => p.id === params.id);

  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
}
