import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.db')) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be a .db file' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Backup current database before restoring
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const backupPath = path.join(
      process.cwd(),
      'prisma',
      `dev-backup-${Date.now()}.db`
    );

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    }

    // Restore from uploaded file
    fs.writeFileSync(dbPath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Database restored successfully',
    });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}