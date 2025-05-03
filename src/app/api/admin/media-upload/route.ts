import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'superadmin'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const media = await prisma.media.findMany({
      include: { destination: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'superadmin'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const mediaType = formData.get('mediaType') as 'IMAGE' | 'VIDEO' | 'REEL';
    const destinationId = formData.get('destinationId') as string;

    if (!file || !title || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    interface CloudinaryUploadResult {
      secure_url: string;
      public_id: string;
    }

    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `travel-agency/${mediaType.toLowerCase()}s`,
          resource_type: mediaType === 'IMAGE' ? 'image' : 'video',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      ).end(buffer);
    });

    const newMedia = await prisma.media.create({
      data: {
        title,
        description,
        type: mediaType,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        destinationId: destinationId || null,
      },
    });

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json(
      { error: 'Failed to create media' },
      { status: 500 }
    );
  }
}

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
