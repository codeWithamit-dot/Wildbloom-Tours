import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { tripSchema } from '../../../../lib/validations/trip';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing trip ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validation = tripSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        ...validation.data,
        price: Number(validation.data.price),
        startDate: new Date(validation.data.startDate),
        endDate: new Date(validation.data.endDate),
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error: unknown) {
    console.error('[TRIP_PUT_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing trip ID' },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { tripId: id }
    });

    if (bookings.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete trip with active bookings',
          bookings: bookings.length 
        },
        { status: 400 }
      );
    }

    const deletedTrip = await prisma.trip.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: deletedTrip,
    });
  } catch (error: unknown) {
    console.error('[TRIP_DELETE_ERROR]', error);
    
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        );
      }
      
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Cannot delete - trip has related bookings' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete trip', details: (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}