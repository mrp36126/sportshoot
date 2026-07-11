/**
 * Shooting Sessions API
 * 
 * POST /api/sessions - Create a new shooting session
 * GET /api/sessions - Get user's shooting sessions
 * GET /api/sessions?id={id} - Get a specific session
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createShootingSession, getUserSessions, getSessionById } from '@/lib/turso/queries';
import { calculateFinalScore } from '@/engine/scoring';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      shooting_range_id,
      firearm_id,
      calibre,
      shooting_distance,
      number_of_shots,
      raw_target_score,
      group_size_mm,
      before_image_url,
      after_image_url,
      shot_datetime,
      timezone,
      notes,
    } = body;

    // Validate required fields
    if (!shooting_range_id || !firearm_id || !calibre || !shooting_distance || !number_of_shots) {
      return NextResponse.json(
        { error: 'Missing required fields: shooting_range_id, firearm_id, calibre, shooting_distance, number_of_shots' },
        { status: 400 }
      );
    }

    // Calculate scoring
    const scoringResult = raw_target_score != null
      ? calculateFinalScore({
          rawTargetScore: raw_target_score,
          distanceMeters: shooting_distance,
          groupSizeMm: group_size_mm ?? null,
        })
      : null;

    const newSession = await createShootingSession({
      user_id: session.user.id,
      shooting_range_id,
      firearm_id,
      calibre,
      shooting_distance,
      number_of_shots,
      raw_target_score: raw_target_score ?? null,
      distance_multiplier: scoringResult?.distanceMultiplier ?? null,
      group_size_mm: group_size_mm ?? null,
      grouping_bonus: scoringResult?.groupingBonus ?? null,
      final_score: scoringResult?.finalScore ?? null,
      before_image_url: before_image_url ?? null,
      after_image_url: after_image_url ?? null,
      status: 'completed',
      shot_datetime: shot_datetime ?? new Date().toISOString(),
      timezone: timezone ?? null,
      notes: notes ?? null,
    });

    return NextResponse.json({
      session: newSession,
      scoring: scoringResult,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (id) {
      const shootingSession = await getSessionById(id);
      if (!shootingSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      if (shootingSession.user_id !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      return NextResponse.json({ session: shootingSession });
    }

    const sessions = await getUserSessions(session.user.id, limit, offset);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}