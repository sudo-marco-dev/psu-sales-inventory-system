import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            username: true,
          },
        },
        saleItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, discount = 0, taxAmount = 0 } = body;

    // Calculate totals
    let totalAmount = 0;
    const saleItems = [];

    // Validate stock and calculate totals
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

      if (product.stockLevel < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const subtotal = product.unitPrice * item.quantity;
      totalAmount += subtotal;

      saleItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        subtotal,
      });
    }

    const netAmount = totalAmount + taxAmount - discount;

    // Generate sale number
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await prisma.sale.count();
    const saleNumber = `SALE-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Create sale with transaction
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          userId,
          totalAmount,
          taxAmount,
          discount,
          netAmount,
          paymentMethod: 'CASH',
          saleItems: {
            create: saleItems,
          },
        },
        include: {
          saleItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              fullName: true,
            },
          },
        },
      });

      // Update stock levels
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockLevel: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Create sale error:', error);
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    );
  }
}