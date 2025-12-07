import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'today'; // today, week, month

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
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
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.netAmount, 0);
    const totalSales = sales.length;
    const totalItems = sales.reduce((sum, sale) => sum + sale.saleItems.length, 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Sales by day (for charts)
    const salesByDay: { [key: string]: number } = {};
    sales.forEach(sale => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      salesByDay[date] = (salesByDay[date] || 0) + sale.netAmount;
    });

    return NextResponse.json({
      period,
      totalRevenue,
      totalSales,
      totalItems,
      averageSale,
      sales,
      salesByDay,
    });
  } catch (error) {
    console.error('Get sales summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales summary' },
      { status: 500 }
    );
  }
}