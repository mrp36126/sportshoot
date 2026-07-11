/**
 * Leaderboard API
 * 
 * GET /api/leaderboard - Get leaderboard entries
 *   ?period=today|weekly|monthly|yearly|all_time
 *   ?distance=10 (optional, filter by distance)
 *   ?calibre=9mm (optional, filter by calibre)
 *   ?limit=50
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLeaderboard, getLeaderboardByDistance, getLeaderboardByCalibre, type LeaderboardPeriod } from '@/lib/turso/queries';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as LeaderboardPeriod) || 'all_time';
    const distance = searchParams.get('distance');
    const calibre = searchParams.get('calibre');
    const limit = parseInt(searchParams.get('limit') || '50');

    let entries;
    if (distance) {
      entries = await getLeaderboardByDistance(parseFloat(distance), period, limit);
    } else if (calibre) {
      entries = await getLeaderboardByCalibre(calibre, period, limit);
    } else {
      entries = await getLeaderboard(period, limit);
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}