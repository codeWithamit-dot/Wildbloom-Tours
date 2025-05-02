import { z } from 'zod';

export const bookingSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  status: z.string().default('pending'), 
});
