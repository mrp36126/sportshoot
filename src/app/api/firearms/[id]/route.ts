/**
 * Firearm API
 * 
 * DELETE /api/firearms/{id} - Delete a user's firearm
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteUserFirearm } from '@/lib/turso/queries';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await deleteUserFirearm(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete firearm:', error);
    return NextResponse.json(
      { error: 'Failed to delete firearm' },
      { status: 500 }
    );
  }
}