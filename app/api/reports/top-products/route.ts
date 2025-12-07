import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all sale items with product info
    const saleItems = await prisma.saleItem.findMany({
      include: {
        product: true,
        sale: true,
      },
    });

    // Calculate sales per product
    const productSales: { [key: string]: { product: any; totalQuantity: number; totalRevenue: number } } = {};

    saleItems.forEach(item => {
      const productId = item.productId;
      if (!productSales[productId]) {
        productSales[productId] = {
          product: item.product,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      productSales[productId].totalQuantity += item.quantity;
      productSales[productId].totalRevenue += item.subtotal;
    });

    // Convert to array and sort
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    // Get slow-moving products (products with low or no sales)
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
    });

    const slowMovingProducts = allProducts
      .filter(product => {
        const sales = productSales[product.id];
        return !sales || sales.totalQuantity < 5;
      })
      .slice(0, 10);

    return NextResponse.json({
      topProducts,
      slowMovingProducts,
    });
  } catch (error) {
    console.error('Get top products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product performance' },
      { status: 500 }
    );
  }
}