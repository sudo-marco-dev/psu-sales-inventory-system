import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, totalAmount } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 404 }
      );
    }

    // Check if active
    if (!discount.isActive) {
      return NextResponse.json(
        { error: 'This discount code is no longer active' },
        { status: 400 }
      );
    }

    // Check date validity
    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) {
      return NextResponse.json(
        { error: 'This discount code is not valid at this time' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return NextResponse.json(
        { error: 'This discount code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (totalAmount < discount.minPurchase) {
      return NextResponse.json(
        { 
          error: `Minimum purchase of ₱${discount.minPurchase.toFixed(2)} required for this discount`,
          minPurchase: discount.minPurchase,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discountType === 'PERCENTAGE') {
      discountAmount = (totalAmount * discount.discountValue) / 100;
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else if (discount.discountType === 'FIXED_AMOUNT') {
      discountAmount = discount.discountValue;
    }

    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    console.error('Validate discount error:', error);
    return NextResponse.json(
      { error: 'Failed to validate discount' },
      { status: 500 }
    );
  }
}