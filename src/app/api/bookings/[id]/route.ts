import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

// GET a booking by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing booking ID" }, { status: 400 });
    }

    const bookingIdInt = parseInt(id);
    if (isNaN(bookingIdInt)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdInt },
      include: { trip: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("[BOOKING_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH to update booking
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { paymentStatus } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing booking ID" }, { status: 400 });
    }

    const bookingIdInt = parseInt(id);
    if (isNaN(bookingIdInt)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 });
    }

    if (!paymentStatus || !["pending", "paid"].includes(paymentStatus)) {
      return NextResponse.json({ success: false, error: "Invalid paymentStatus" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdInt },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingIdInt },
      data: { paymentStatus },
    });

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("[BOOKING_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// PUT to update booking status (admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing booking ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const bookingIdInt = parseInt(id);
    if (isNaN(bookingIdInt)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdInt },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingIdInt },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        trip: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("[BOOKING_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}