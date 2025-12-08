import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json(
        { error: 'Database file not found' },
        { status: 404 }
      );
    }

    const dbBuffer = fs.readFileSync(dbPath);
    
    return new NextResponse(dbBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="psu-backup-${new Date().toISOString().split('T')[0]}.db"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}