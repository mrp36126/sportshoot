/**
 * Statistics API
 * 
 * GET /api/statistics - Get user's shooting statistics
 * GET /api/statistics/history - Get historical sessions for progress tracking
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserStats, getHistoricalSessions } from '@/lib/turso/queries';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'history') {
      const limit = parseInt(searchParams.get('limit') || '100');
      const history = await getHistoricalSessions(session.user.id, limit);
      return NextResponse.json({ history });
    }

    const stats = await getUserStats(session.user.id);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}