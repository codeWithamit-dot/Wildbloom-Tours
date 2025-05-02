import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Booking, BookingListResponse } from '../types/api/booking';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchTrips() {
  const res = await fetch("/api/trips");
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
}

export async function fetchApprovedBookings(): Promise<Booking[]> {
  try {
    const res = await fetch("/api/bookings");

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch bookings');
    }

    const response: BookingListResponse = await res.json();

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch bookings');
    }

    return response.data.filter(
      (booking: Booking) => booking.status === "approved" && booking.paymentStatus === "paid"
    );
  } catch (error) {
    console.error("Error in fetching approved bookings:", error);
    throw error;
  }
}

export async function fetchUserBookings(): Promise<Booking[]> {
  try {
    const res = await fetch("/api/bookings");

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch bookings');
    }

    const response: BookingListResponse = await res.json();

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch bookings');
    }

    return response.data.filter(
      (booking: Booking) => booking.status === "approved"
    );
  } catch (error) {
    console.error("Error in fetching user bookings:", error);
    throw error;
  }
}
