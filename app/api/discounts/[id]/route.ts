import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discount = await prisma.discount.findUnique({
      where: { id: params.id },
    });

    if (!discount) {
      return NextResponse.json(
        { error: 'Discount not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(discount);
  } catch (error) {
    console.error('Get discount error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
    } = body;

    // Validation
    if (!code || !name || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if code already exists for another discount
    const existing = await prisma.discount.findFirst({
      where: {
        code: code.toUpperCase(),
        NOT: {
          id: params.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    // Update discount
    const discount = await prisma.discount.update({
      where: { id: params.id },
      data: {
        code: code.toUpperCase(),
        name,
        description: description || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: parseFloat(minPurchase || '0'),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        applicableFor: applicableFor || 'ALL',
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(discount);
  } catch (error) {
    console.error('Update discount error:', error);
    return NextResponse.json(
      { error: 'Failed to update discount' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if discount is used in any sales
    const usedInSales = await prisma.saleDiscount.findFirst({
      where: { discountId: params.id },
    });

    if (usedInSales) {
      return NextResponse.json(
        { error: 'Cannot delete discount that has been used in sales. You can deactivate it instead.' },
        { status: 400 }
      );
    }

    await prisma.discount.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete discount error:', error);
    return NextResponse.json(
      { error: 'Failed to delete discount' },
      { status: 500 }
    );
  }
}