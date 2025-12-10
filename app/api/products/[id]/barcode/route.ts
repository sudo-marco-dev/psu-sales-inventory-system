import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEAN13, generateCode128, generateBarcodeLabelHTML, validateEAN13 } from '@/lib/barcode';

interface RouteParams {
  params: {
    id: string;
  };
}

// Get barcode for a product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product already has a barcode
    let barcode = product.barcode || null;

    // If no barcode, generate one
    if (!barcode) {
      // Use EAN-13 for products
      barcode = generateEAN13(product.id);
    }

    return NextResponse.json({
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      barcode,
      hasBarcode: !!product.barcode,
    });
  } catch (error: any) {
    console.error('Get barcode error:', error);
    return NextResponse.json(
      { error: 'Failed to get barcode', details: error.message },
      { status: 500 }
    );
  }
}

// Generate/Update barcode for a product
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { barcodeType = 'EAN13', customBarcode } = body;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let barcode: string;

    if (customBarcode) {
      // Use custom barcode (validate if EAN-13)
      if (barcodeType === 'EAN13' && !validateEAN13(customBarcode)) {
        return NextResponse.json(
          { error: 'Invalid EAN-13 barcode format' },
          { status: 400 }
        );
      }
      barcode = customBarcode;
    } else {
      // Generate barcode based on type
      switch (barcodeType) {
        case 'EAN13':
          barcode = generateEAN13(product.id);
          break;
        case 'Code128':
          barcode = generateCode128(product.code);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid barcode type' },
            { status: 400 }
          );
      }
    }

    // Check for duplicate barcode
    const existingBarcode = await prisma.product.findFirst({
      where: {
        barcode,
        id: { not: id },
      },
    });

    if (existingBarcode) {
      return NextResponse.json(
        { error: 'This barcode is already assigned to another product' },
        { status: 409 }
      );
    }

    // Update product with barcode
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { barcode },
    });

    return NextResponse.json({
      success: true,
      barcode,
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error('Generate barcode error:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcode', details: error.message },
      { status: 500 }
    );
  }
}

// Delete barcode from product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { barcode: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Barcode removed',
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error('Delete barcode error:', error);
    return NextResponse.json(
      { error: 'Failed to delete barcode', details: error.message },
      { status: 500 }
    );
  }
}
