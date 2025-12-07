import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

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
    const { code, name, description, categoryId, supplierId, unitPrice, reorderLevel } = body;

    const product = await prisma.product.create({
      data: {
        code,
        name,
        description,
        categoryId,
        supplierId,
        unitPrice: parseFloat(unitPrice),
        reorderLevel: parseInt(reorderLevel) || 10,
        stockLevel: 0,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}