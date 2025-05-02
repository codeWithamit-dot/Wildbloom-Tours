import { z } from 'zod';

export const tripSchema = z.object({
  destination: z.string().min(1),
  country: z.string().min(1),
  description: z.string().min(1),
  highlights: z.string().min(1),
  price: z.number().min(0),
  startDate: z.union([
    z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
    z.date(),
  ]),
  endDate: z.union([
    z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
    z.date(),
  ]),
  imageUrl: z.string().url().or(z.string().startsWith('/')),
});
