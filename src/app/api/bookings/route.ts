import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { prisma } from "../../../lib/prisma";

// GET all bookings (admin: all, user: own)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "admin";

    const bookings = await prisma.booking.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        trip: true,
      },
      orderBy: {
        bookedAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("[BOOKINGS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings", data: [] },
      { status: 500 }
    );
  }
}

// POST to create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await request.json();

    if (!tripId) {
      return NextResponse.json({ success: false, error: "Missing tripId" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        tripId,
        status: "pending",
        paymentStatus: "pending",
        bookedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        trip: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newBooking,
      message: "Booking created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("[BOOKINGS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking", data: null },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
