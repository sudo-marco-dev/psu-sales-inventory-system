import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // week, month

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    startDate.setHours(0, 0, 0, 0);

    // Get all sales in period
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Get all purchases in period
    const purchases = await prisma.purchase.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Calculate revenue (from sales)
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.netAmount, 0);

    // Calculate cost (from purchases)
    const totalCost = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

    // Calculate gross profit
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      period,
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin,
      salesCount: sales.length,
      purchasesCount: purchases.length,
    });
  } catch (error) {
    console.error('Get profit/loss error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profit/loss data' },
      { status: 500 }
    );
  }
}