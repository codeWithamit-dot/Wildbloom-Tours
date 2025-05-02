"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "../../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import { Skeleton } from "../../../../../../components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import { CreditCard, MapPin, CalendarDays, AlertCircle } from "lucide-react";
import { Booking } from "../../../../../../types/api/booking";
import { Trip } from "../../../../../../types/api/trips";
import { fetchTrips, fetchUserBookings } from "../../../../../../lib/utils";

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
console.log(
  "[PAYMENT_PAGE] Stripe Publishable Key:",
  STRIPE_PUBLISHABLE_KEY ? "Set" : "Missing"
);
if (!STRIPE_PUBLISHABLE_KEY) {
  console.error(
    "[PAYMENT_PAGE] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in .env.local"
  );
}

const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-production-domain.com"
    : "http://localhost:3000";

interface CustomSession {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

function PaymentForm({ trip, booking }: { trip: Trip; booking: Booking }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error(
        "Payment system not initialized. Check Stripe configuration."
      );
      return;
    }

    setProcessing(true);
    try {
      console.log("[PAYMENT_FORM] Initiating payment for booking:", booking.id);
      const res = await fetch(`${API_BASE_URL}/api/payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id.toString(),
          amount: Math.round(trip.price * 100),
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || "No response text";
        throw new Error(text || "Failed to create payment intent");
      }

      const { clientSecret } = await res.json();
      if (!clientSecret) throw new Error("Missing clientSecret");

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card details missing");

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed");
      }

      if (paymentIntent?.status === "succeeded") {
        console.log(
          "[PAYMENT_FORM] Payment succeeded, updating booking:",
          booking.id
        );
        const updateRes = await fetch(
          `${API_BASE_URL}/api/bookings/${booking.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: "paid" }),
            credentials: "include",
          }
        );

        if (!updateRes.ok) {
          throw new Error("Failed to update booking status");
        }

        toast.success("Payment successful!");
        router.push("/dashboard/user");
      } else {
        throw new Error("Payment not completed");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown payment error";
      console.error("[PAYMENT_FORM_ERROR]", message, err);
      setPaymentError(message);
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Card Details
        </label>
        <div className="p-2 mt-1 border rounded-md">
          {elements ? (
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#374151",
                    "::placeholder": { color: "#9ca3af" },
                  },
                  invalid: { color: "#ef4444" },
                },
              }}
            />
          ) : (
            <p className="text-red-500 text-sm">Card input failed to load</p>
          )}
        </div>
      </div>
      {paymentError && <p className="text-red-500 text-sm">{paymentError}</p>}
      <Button
        type="submit"
        className="w-full bg-teal-500 hover:bg-teal-600 text-white"
        disabled={processing || !stripe || !elements}
      >
        {processing ? (
          "Processing..."
        ) : (
          <>
            <CreditCard size={20} className="mr-2" /> Pay ₹{trip.price}
          </>
        )}
      </Button>
    </form>
  );
}

export default function PaymentPage() {
  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: string;
  };
  const router = useRouter();
  const params = useParams();
  const tripId = Array.isArray(params.trips) ? params.trips[0] : params.trips;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  console.log(
    "[PAYMENT_PAGE] Loading with tripId:",
    tripId,
    "sessionStatus:",
    status
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("[PAYMENT_PAGE] Redirecting to login, unauthenticated");
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && tripId && session?.user?.id) {
      console.log(
        "[PAYMENT_PAGE] Fetching trip and booking for user:",
        session.user.id
      );
      fetchTripAndBooking(tripId);
    } else if (status === "authenticated" && !session?.user?.id) {
      console.error("[PAYMENT_PAGE] Session missing user ID");
      setPageError("Session is missing user ID");
      setPageLoading(false);
    }
  }, [status, tripId, session, router]);

  const fetchTripAndBooking = async (tripId: string) => {
    try {
      setPageLoading(true);
      setPageError(null);

      console.log("[FETCH_TRIP] Attempting to fetch trip with ID:", tripId);
      let trip: Trip | null = null;
      try {
        const trips = await fetchTrips();
        trip = trips.find((t: Trip) => t.id === tripId) || null;
        if (!trip) {
          throw new Error("Trip not found in fetchTrips");
        }
        console.log("[FETCH_TRIP_SUCCESS] Trip data from fetchTrips:", trip);
      } catch (err) {
        console.warn(
          "[FETCH_TRIPS_WARNING] fetchTrips failed, falling back to direct fetch:",
          err
        );
        const tripUrl = `${API_BASE_URL}/api/trips/${tripId}`;
        console.log("[FETCH_TRIP] Fallback URL:", tripUrl);
        const tripRes = await fetch(tripUrl, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!tripRes.ok) {
          const errorText = (await tripRes.text()) || "No response text";
          console.error(
            `[FETCH_TRIP_ERROR] Status: ${tripRes.status}, Response: ${errorText}, Headers:`,
            Object.fromEntries(tripRes.headers.entries())
          );
          if (tripRes.status === 405) {
            throw new Error(
              "Trip endpoint rejected GET request. Ensure src/app/api/trips/[id]/route.ts exists with a GET handler in the correct directory (src/app/api/trips/[id]/route.ts, where [id] is a folder). Verify middleware skips /api/* routes. Check server logs for details."
            );
          }
          throw new Error(
            `Trip fetch failed with status: ${tripRes.status} - ${errorText}`
          );
        }
        const tripData = await tripRes.json();
        if (!tripData.success || !tripData.data) {
          throw new Error(tripData?.error || "Invalid trip data");
        }
        trip = tripData.data;
        console.log("[FETCH_TRIP_SUCCESS] Trip data from fallback:", trip);
      }

      setTrip(trip);

      console.log("[FETCH_BOOKINGS] Attempting to fetch bookings");
      const bookings = await fetchUserBookings();
      console.log("[FETCH_BOOKINGS_SUCCESS] Bookings data:", bookings);
      const pendingBooking = bookings.find(
        (b: Booking) =>
          b.tripId === tripId &&
          b.paymentStatus === "pending" &&
          b.status === "approved"
      );

      if (!pendingBooking) {
        throw new Error("No pending and approved booking found for this trip");
      }

      setBooking(pendingBooking);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown fetch error";
      console.error("[FETCH_ERROR]", errorMessage, err);
      setPageError(errorMessage);
    } finally {
      setPageLoading(false);
    }
  };

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
        <Card className="max-w-md mx-auto shadow-md rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center text-gray-800">
              <AlertCircle className="text-red-500 mr-2" /> Configuration Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Stripe publishable key is missing. Please set
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local.
            </p>
            <Button
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white"
              onClick={() => router.push("/dashboard/user")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
        <Card className="max-w-md mx-auto shadow-md rounded-xl bg-white">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageError || !trip || !booking) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
        <Card className="max-w-md mx-auto shadow-md rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center text-gray-800">
              <AlertCircle className="text-red-500 mr-2" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {pageError || "Unable to load trip or booking"}
            </p>
            <Button
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white"
              onClick={() => router.push("/dashboard/user")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <Card className="shadow-md rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Payment for {trip.destination}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin size={20} className="text-teal-500" />
                <span>{trip.country}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDays size={20} className="text-teal-500" />
                <span>
                  {format(new Date(trip.startDate), "dd MMM yyyy", {
                    locale: enUS,
                  })}{" "}
                  →{" "}
                  {format(new Date(trip.endDate), "dd MMM yyyy", {
                    locale: enUS,
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard size={20} className="text-amber-400" />
                <span className="font-semibold text-amber-400">
                  ₹{trip.price}
                </span>
              </div>
            </div>

            <Elements stripe={stripePromise}>
              <PaymentForm trip={trip} booking={booking} />
            </Elements>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}