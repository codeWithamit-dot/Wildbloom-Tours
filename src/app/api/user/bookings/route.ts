import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

const parseBookingId = (id: string) => {
  const bookingId = parseInt(id);
  if (!id || isNaN(bookingId)) {
    return { valid: false, error: "Invalid booking ID" };
  }
  return { valid: true, bookingId };
};

// GET a booking by ID
export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const { valid, bookingId, error } = parseBookingId(id || "");
    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("[BOOKING_GET_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch booking" }, { status: 500 });
  }
}

// PATCH to update booking's paymentStatus (user only)
export async function PATCH(req: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const { valid, bookingId, error } = parseBookingId(id || "");
    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const { paymentStatus } = await req.json();
    if (!["pending", "paid"].includes(paymentStatus)) {
      return NextResponse.json({ success: false, error: "Invalid paymentStatus" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus },
    });

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("[BOOKING_PATCH_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
  }
}

// PUT to update booking status (admin only)
export async function PUT(req: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const { valid, bookingId, error } = parseBookingId(id || "");
    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const { status } = await req.json();
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        trip: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("[BOOKING_PUT_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
  }
}