/**
 * Users API
 * 
 * GET /api/users - Get current user profile
 * PUT /api/users - Update user profile
 * GET /api/users?admin=true - Get all users (admin only)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserById, updateUserProfile, getAllUsers } from '@/lib/turso/queries';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Admin: get all users
    if (searchParams.get('admin') === 'true') {
      const currentUser = await getUserById(session.user.id);
      if (currentUser?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const users = await getAllUsers();
      return NextResponse.json({ users });
    }

    // Get current user profile
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        profile_image_url: user.profile_image_url,
        role: user.role,
        country: user.country,
        province: user.province,
        city: user.city,
        club_name: user.club_name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, country, province, city, club_name, profile_image_url } = body;

    await updateUserProfile(session.user.id, {
      display_name,
      country,
      province,
      city,
      club_name,
      profile_image_url,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}