import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const active = searchParams.get('active');

    const discounts = await prisma.discount.findMany({
      where: {
        AND: [
          {
            OR: [
              { code: { contains: search } },
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          },
          active !== null ? { isActive: active === 'true' } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Get discounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      applicableFor,
    } = body;

    if (!code || !name || !discountType || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.discount.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.create({
      data: {
        code,
        name,
        description: description || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        applicableFor: applicableFor || 'ALL',
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    console.error('Create discount error:', error);
    return NextResponse.json(
      { error: 'Failed to create discount' },
      { status: 500 }
    );
  }
}