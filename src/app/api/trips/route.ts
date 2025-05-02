import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { tripSchema } from '../../../lib/validations/trip';

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      select: {
        id: true,
        destination: true,
        country: true,
        description: true,
        highlights: true,
        price: true,
        startDate: true,
        endDate: true,
        imageUrl: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const formattedData = {
      ...body,
      price: Number(body.price),
      startDate: body.startDate ? new Date(body.startDate).toISOString() : undefined,
      endDate: body.endDate ? new Date(body.endDate).toISOString() : undefined,
    };

    const validation = tripSchema.safeParse(formattedData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const newTrip = await prisma.trip.create({
      data: validation.data,
    });

    return NextResponse.json(newTrip);
  } catch (error) {
    console.error('[TRIP_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}

