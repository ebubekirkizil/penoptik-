// packages/ecommerce/products/src/api/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ICategory } from '../../db/models/Category';
import { UUID } from 'crypto';

// Placeholder for a simple in-memory store for demonstration
const categories: ICategory[] = [];

/**
 * @method GET
 * @route /api/categories
 * @description Get all categories (with optional hierarchy/filtering)
 * @returns {NextResponse<ICategory[]>} A list of categories
 */
export async function GET(req: NextRequest) {
  // In a real application, this would fetch from a database using an ORM.
  return NextResponse.json(categories);
}

/**
 * @method POST
 * @route /api/categories
 * @description Create a new category
 * @param {NextRequest} req - The request object containing the category data.
 * @returns {NextResponse<ICategory>} The created category.
 */
export async function POST(req: NextRequest) {
  try {
    const newCategoryData: Omit<ICategory, 'id' | 'created_at' | 'updated_at'> = await req.json();
    const newCategory: ICategory = {
      id: '' as UUID, // Placeholder UUID generation
      ...newCategoryData,
      is_active: newCategoryData.is_active ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    categories.push(newCategory);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create category', error: error.message }, { status: 500 });
  }
}
