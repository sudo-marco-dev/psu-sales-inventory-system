import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total products
    const totalProducts = await prisma.product.count({
      where: { isActive: true },
    });

    // Get low stock products
    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        stockLevel: {
          lte: prisma.product.fields.reorderLevel,
        },
      },
    });

    // Get today's sales
    const todaySales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.netAmount, 0);
    const todaySalesCount = todaySales.length;

    // Get recent sales
    const recentSales = await prisma.sale.findMany({
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
        saleItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get low stock alert items
    const lowStockItems = await prisma.product.findMany({
      where: {
        isActive: true,
        stockLevel: {
          lte: prisma.product.fields.reorderLevel,
        },
      },
      include: {
        category: true,
      },
      orderBy: { stockLevel: 'asc' },
      take: 10,
    });

    return NextResponse.json({
      totalProducts,
      lowStockProducts,
      todayRevenue,
      todaySalesCount,
      recentSales,
      lowStockItems,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}