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
        customer: {
          select: {
            name: true,
            customerNumber: true,
          },
        },
        saleItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
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
    const { userId, items, discount, taxAmount, paymentMethod, customerId } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    let totalAmount = 0;
    const saleItems = [];

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

      const subtotal = item.quantity * product.unitPrice;
      totalAmount += subtotal;

      saleItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        subtotal,
      });
    }

    // Calculate net amount after discount and tax
    const netAmount = totalAmount - (discount || 0) + (taxAmount || 0);

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
          customerId: customerId || null,  // Optional customer
          totalAmount,        // Total before discount/tax
          netAmount,          // Final amount after discount/tax
          discountAmount: discount || 0,   // Updated field name
          taxAmount: taxAmount || 0,
          paymentMethod: paymentMethod || 'CASH',
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
          customer: {
            select: {
              name: true,
              customerNumber: true,
            },
          },
        },
      });

      // Update stock levels (reduce inventory)
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