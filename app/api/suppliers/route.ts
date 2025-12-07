import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { companyName: 'asc' },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, contactPerson, email, phone, address } = body;

    if (!companyName || !contactPerson || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        companyName,
        contactPerson,
        email: email || null,
        phone,
        address: address || null,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}