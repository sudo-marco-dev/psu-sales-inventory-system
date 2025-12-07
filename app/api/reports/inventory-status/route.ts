import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { stockLevel: 'asc' },
    });

    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stockLevel <= p.reorderLevel);
    const outOfStockProducts = products.filter(p => p.stockLevel === 0);
    
    // Calculate total inventory value
    const totalInventoryValue = products.reduce(
      (sum, product) => sum + (product.stockLevel * product.unitPrice),
      0
    );

    // Stock by category
    const stockByCategory: { [key: string]: { count: number; value: number } } = {};
    products.forEach(product => {
      const categoryName = product.category.name;
      if (!stockByCategory[categoryName]) {
        stockByCategory[categoryName] = { count: 0, value: 0 };
      }
      stockByCategory[categoryName].count += product.stockLevel;
      stockByCategory[categoryName].value += product.stockLevel * product.unitPrice;
    });

    return NextResponse.json({
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalInventoryValue,
      lowStockProducts,
      outOfStockProducts,
      stockByCategory,
      allProducts: products,
    });
  } catch (error) {
    console.error('Get inventory status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory status' },
      { status: 500 }
    );
  }
}