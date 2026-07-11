/**
 * GitHub Image Upload API
 * 
 * POST /api/github/upload - Upload before/after images to GitHub
 *   Body: { beforeImage: base64, afterImage: base64 }
 *   Returns: { beforeUrl, afterUrl }
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadSessionImages } from '@/lib/github/image-service';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { beforeImage, afterImage } = body;

    if (!beforeImage || !afterImage) {
      return NextResponse.json(
        { error: 'Both beforeImage and afterImage are required' },
        { status: 400 }
      );
    }

    const urls = await uploadSessionImages(
      session.user.id,
      beforeImage,
      afterImage
    );

    return NextResponse.json(urls);
  } catch (error) {
    console.error('GitHub upload failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image upload failed' },
      { status: 500 }
    );
  }
}