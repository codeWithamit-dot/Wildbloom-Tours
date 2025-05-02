import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";
import { stripe } from "../../../lib/stripe";
import { Booking } from "../../../types/api/booking"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, amount } = await req.json();
    if (!bookingId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing bookingId or amount" },
        { status: 400 }
      );
    }

    const bookingIdInt = parseInt(bookingId);
    if (isNaN(bookingIdInt)) {
      return NextResponse.json({ success: false, error: "Invalid bookingId" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdInt },
      include: { trip: true },
    }) as Booking | null;

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    if (booking.paymentStatus !== "pending") {
      return NextResponse.json(
        { success: false, error: "Booking already paid or invalid" },
        { status: 400 }
      );
    }

    if (!booking.trip || Math.round(booking.trip.price * 100) !== amount) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { bookingId: bookingIdInt.toString() },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("[PAYMENT_INTENT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}