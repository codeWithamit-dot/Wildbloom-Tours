import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

const validateBookingId = (id: string) => {
  const bookingIdInt = parseInt(id);
  if (isNaN(bookingIdInt)) {
    return { valid: false, error: "Invalid booking ID" };
  }
  return { valid: true, bookingIdInt };
};

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/").pop() || "";
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing booking ID" }, { status: 400 });
    }

    const { valid, bookingIdInt, error } = validateBookingId(id);
    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
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

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split("/").pop() || "";
    const { paymentStatus } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing booking ID" }, { status: 400 });
    }

    const { valid, bookingIdInt, error } = validateBookingId(id);
    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split("/").pop() || "";
    const { status } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing booking ID" }, { status: 400 });
    }

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const { valid, bookingIdInt, error } = validateBookingId(id);
    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
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
export const dynamic = "force-dynamic";