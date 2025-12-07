import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            username: true,
          },
        },
        supplier: true,
        purchaseItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Get purchases error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, supplierId, items, notes } = body;

    if (!userId || !supplierId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate total
    let totalAmount = 0;
    const purchaseItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      const subtotal = item.unitCost * item.quantity;
      totalAmount += subtotal;

      purchaseItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitCost: item.unitCost,
        subtotal,
      });
    }

    // Generate purchase number
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await prisma.purchase.count();
    const purchaseNumber = `PO-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Create purchase with transaction
    const purchase = await prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          userId,
          supplierId,
          totalAmount,
          notes: notes || null,
          purchaseItems: {
            create: purchaseItems,
          },
        },
        include: {
          purchaseItems: {
            include: {
              product: true,
            },
          },
          supplier: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
      });

      // Update stock levels (add to inventory)
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockLevel: {
              increment: item.quantity,
            },
          },
        });
      }

      return newPurchase;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error('Create purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    );
  }
}