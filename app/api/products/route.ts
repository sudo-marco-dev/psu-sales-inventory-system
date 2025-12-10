import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action');

    // Generate next product code
    if (action === 'generate-code') {
      const categoryId = searchParams.get('categoryId');
      
      if (!categoryId) {
        return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      // Get category prefix (first 3 letters, uppercase)
      const prefix = category.name.substring(0, 3).toUpperCase();
      
      // Count products in this category
      const count = await prisma.product.count({
        where: { categoryId },
      });

      // Generate code: PREFIX-XXXX (e.g., MOU-0001, KEY-0042)
      const code = `${prefix}-${String(count + 1).padStart(4, '0')}`;

      return NextResponse.json({ code });
    }

    // Regular product search
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
        ],
      },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description, categoryId, supplierId, unitPrice, reorderLevel, stockLevel } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Product code is required' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (!supplierId) {
      return NextResponse.json({ error: 'Supplier is required' }, { status: 400 });
    }

    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      return NextResponse.json({ error: 'Valid unit price is required' }, { status: 400 });
    }

    // Check for duplicate code
    const existingCode = await prisma.product.findUnique({
      where: { code: code.trim() },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Product code already exists. Please use a different code.' },
        { status: 409 }
      );
    }

    // Check for duplicate name in same category
    const existingName = await prisma.product.findFirst({
      where: {
        name: name.trim(),
        categoryId,
      },
    });

    if (existingName) {
      return NextResponse.json(
        { error: 'A product with this name already exists in this category.' },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        categoryId,
        supplierId,
        unitPrice: parseFloat(unitPrice),
        reorderLevel: parseInt(reorderLevel) || 10,
        stockLevel: parseInt(stockLevel) || 0,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}