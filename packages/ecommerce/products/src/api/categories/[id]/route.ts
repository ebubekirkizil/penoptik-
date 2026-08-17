// packages/ecommerce/products/src/api/categories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ICategory } from '../../../db/models/Category';
import { UUID } from 'crypto';

// Placeholder for a simple in-memory store for demonstration
// In a real app, this would be an ORM interaction
const categories: ICategory[] = []; // Re-initialize or import from a shared mock store if available

/**
 * @method GET
 * @route /api/categories/[id]
 * @description Get a single category by ID
 * @param {NextRequest} req - The request object.
 * @param {{ params: { id: UUID } }} { params } - The path parameters containing the category ID.
 * @returns {NextResponse<ICategory | { message: string }>} The category or an error message.
 */
export async function GET(req: NextRequest, { params }: { params: { id: UUID } }) {
  const category = categories.find(c => c.id === params.id);

  if (category) {
    return NextResponse.json(category);
  } else {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  }
}

/**
 * @method PUT
 * @route /api/categories/[id]
 * @description Update an existing category by ID
 * @param {NextRequest} req - The request object containing the updated category data.
 * @param {{ params: { id: UUID } }} { params } - The path parameters containing the category ID.
 * @returns {NextResponse<ICategory | { message: string }>} The updated category or an error message.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: UUID } }) {
  try {
    const updatedData: Partial<ICategory> = await req.json();
    const categoryIndex = categories.findIndex(c => c.id === params.id);

    if (categoryIndex !== -1) {
      categories[categoryIndex] = { ...categories[categoryIndex], ...updatedData, updated_at: new Date() };
      return NextResponse.json(categories[categoryIndex]);
    } else {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update category', error: error.message }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @route /api/categories/[id]
 * @description Delete a category by ID
 * @param {NextRequest} req - The request object.
 * @param {{ params: { id: UUID } }} { params } - The path parameters containing the category ID.
 * @returns {NextResponse<{ message: string }>}
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: UUID } }) {
  const categoryIndex = categories.findIndex(c => c.id === params.id);

  if (categoryIndex !== -1) {
    categories.splice(categoryIndex, 1);
    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  }
}
