/**
 * Database Migration API
 * 
 * POST /api/migrate - Run database migrations
 * This should be called once during initial setup.
 * Protected by MIGRATION_SECRET environment variable.
 */

import { NextResponse } from 'next/server';
import { migrate } from '@/lib/turso/schema';

export async function POST(request: Request) {
  try {
    // Check migration secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const migrationSecret = process.env.MIGRATION_SECRET;

    if (migrationSecret) {
      const token = authHeader?.replace('Bearer ', '');
      if (token !== migrationSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    await migrate();

    return NextResponse.json({
      success: true,
      message: 'Database migrations completed successfully',
    });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}