import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  mediaType: 'IMAGE' | 'VIDEO' | 'REEL';
  url: string;
}

export async function GET() {
  try {
    const mediaItems = await prisma.media.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        type: true, // Use 'type' to match Prisma schema
        url: true,
      },
    });

    const response: MediaItem[] = mediaItems.map((item) => ({
      id: item.id,
      title: item.title || 'Untitled', // Provide a default title if null
      description: item.description || 'No description available', // Provide default description if null
      mediaType: item.type as 'IMAGE' | 'VIDEO' | 'REEL',
      url: item.url,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
