import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions'
import { prisma } from '../../../../../lib/prisma';
import cloudinary from '../../../../../lib/cloudinary';

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'superadmin'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const mediaId = url.searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    if (media.publicId) {
      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.type === 'IMAGE' ? 'image' : 'video',
      });
    }

    await prisma.media.delete({ where: { id: mediaId } });

    return NextResponse.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
