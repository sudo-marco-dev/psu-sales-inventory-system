import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEAN13, generateCode128 } from '@/lib/barcode';

// Bulk generate barcodes for products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, barcodeType = 'EAN13', overwriteExisting = false } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      skipped: [] as string[],
      errors: [] as { productId: string; error: string }[],
    };

    for (const productId of productIds) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          results.errors.push({ productId, error: 'Product not found' });
          continue;
        }

        // Skip if already has barcode and not overwriting
        if (product.barcode && !overwriteExisting) {
          results.skipped.push(productId);
          continue;
        }

        // Generate barcode
        let barcode: string;
        switch (barcodeType) {
          case 'EAN13':
            barcode = generateEAN13(product.id);
            break;
          case 'Code128':
            barcode = generateCode128(product.code);
            break;
          default:
            results.errors.push({ productId, error: 'Invalid barcode type' });
            continue;
        }

        // Check for duplicates
        const existingBarcode = await prisma.product.findFirst({
          where: {
            barcode,
            id: { not: productId },
          },
        });

        if (existingBarcode) {
          results.errors.push({
            productId,
            error: 'Generated barcode conflicts with existing product',
          });
          continue;
        }

        // Update product
        await prisma.product.update({
          where: { id: productId },
          data: { barcode },
        });

        results.success.push(productId);
      } catch (error: any) {
        results.errors.push({
          productId,
          error: error.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: 'Bulk barcode generation completed',
      results,
      summary: {
        total: productIds.length,
        successful: results.success.length,
        skipped: results.skipped.length,
        failed: results.errors.length,
      },
    });
  } catch (error: any) {
    console.error('Bulk barcode generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcodes', details: error.message },
      { status: 500 }
    );
  }
}
