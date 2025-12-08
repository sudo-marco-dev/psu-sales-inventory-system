import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchases = await prisma.purchase.findMany({
      where: {
        supplierId: params.id,
      },
      include: {
        purchaseItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Get supplier history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier history' },
      { status: 500 }
    );
  }
}