import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBarcodeLabelHTML } from '@/lib/barcode';

interface RouteParams {
  params: {
    id: string;
  };
}

// Generate printable barcode label
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    const includePrice = searchParams.get('includePrice') !== 'false';
    const includeProductName = searchParams.get('includeProductName') !== 'false';
    const size = (searchParams.get('size') || 'medium') as 'small' | 'medium' | 'large';

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.barcode) {
      return NextResponse.json(
        { error: 'Product does not have a barcode. Generate one first.' },
        { status: 400 }
      );
    }

    const labelHTML = generateBarcodeLabelHTML(
      {
        code: product.code,
        name: product.name,
        barcode: product.barcode,
        unitPrice: product.unitPrice,
      },
      {
        includePrice,
        includeProductName,
        size,
      }
    );

    return new NextResponse(labelHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('Print barcode error:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcode label', details: error.message },
      { status: 500 }
    );
  }
}
