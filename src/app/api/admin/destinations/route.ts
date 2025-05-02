import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany();
    return NextResponse.json(destinations);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newDestination = await prisma.destination.create({ data: body });
    return NextResponse.json(newDestination);
  } catch (error) {
    console.error('Error creating destination:', error);
    return NextResponse.json({ error: 'Failed to create destination' }, { status: 500 });
  }
}
