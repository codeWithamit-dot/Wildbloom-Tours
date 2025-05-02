import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/route'; // Import authOptions
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { trip: true },
      orderBy: { bookedAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('[BOOKING_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
