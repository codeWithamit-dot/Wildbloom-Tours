export interface BookingListResponse {
  success: boolean;
  error?: string;
  data: Booking[];
}

export interface Booking {
  id: number;
  userId: string;
  tripId: string;
  bookedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'pending' | 'paid';
  bookingDate?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  trip?: {
    id: string;
    destination: string;
    country: string;
    description: string;
    highlights: string;
    price: number;
    startDate: string;
    endDate: string;
    imageUrl?: string;
  };
}