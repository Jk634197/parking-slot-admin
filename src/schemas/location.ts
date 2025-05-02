import { z as zod } from 'zod';

export const parkingZoneSchema = zod.object({
  id: zod.string().optional(),
  name: zod.string().min(1, { message: 'Zone name is required' }),
  price: zod.number().min(0, { message: 'Price must be positive' }),
  minutes: zod.number().min(1, { message: 'Minutes must be at least 1' }),
  totalSlots: zod.number().min(1, { message: 'Total slots must be at least 1' }),
  availableSlots: zod.number().min(0).optional(),
  status: zod.enum(['active', 'inactive']).default('active'),
});

export const locationSchema = zod.object({
  id: zod.string().optional(),
  name: zod.string().min(1, { message: 'Name is required' }),
  address: zod.object({
    address1: zod.string().min(1, { message: 'Address 1 is required' }),
    address2: zod.string().optional(),
    city: zod.string().min(1, { message: 'City is required' }),
    state: zod.string().min(1, { message: 'State is required' }),
    country: zod.string().min(1, { message: 'Country is required' }),
    zip: zod.string().min(1, { message: 'ZIP code is required' }),
    status: zod.enum(['active', 'inactive']).default('active'),
    latitude: zod.number(),
    longitude: zod.number(),
  }),
  parkingZones: zod.array(parkingZoneSchema).min(1, { message: 'At least one parking zone is required' }),
  createdAt: zod.date().optional(),
  updatedAt: zod.date().optional(),
});

export type ParkingZone = zod.infer<typeof parkingZoneSchema>;
export type LocationFormData = zod.infer<typeof locationSchema>;

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}
