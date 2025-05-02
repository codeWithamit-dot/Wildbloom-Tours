import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '../../../../../lib/prisma';
import cloudinary  from '../../../../../lib/cloudinary';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'superadmin'].includes(session.user?.role || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const media = await prisma.media.findUnique({ where: { id: params.id } });

        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }

        if (media.publicId) {
            await cloudinary.uploader.destroy(media.publicId);
        }

        await prisma.media.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete media:', error);
        return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }
}
