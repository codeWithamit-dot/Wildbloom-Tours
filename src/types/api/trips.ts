export interface Trip {
  id: string;
  destination: string;
  country: string;
  description: string;
  highlights: string;
  price: number;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type TripsResponse = ApiResponse<Trip[]>;
export type TripResponse = ApiResponse<Trip>;

export type CreateTripPayload = Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTripPayload = Partial<CreateTripPayload> & { id: string };

export type TripFilters = {
  destination?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  startDateAfter?: string;
  endDateBefore?: string;
};

export type PaginatedTripsResponse = ApiResponse<{
  trips: Trip[];
  total: number;
  page: number;
  limit: number;
}>;