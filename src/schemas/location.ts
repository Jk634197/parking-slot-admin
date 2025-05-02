import { z as zod } from 'zod';

const timeRegex = /^(?:[01]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Base schemas that are common to both request and response
export const parkingZoneBaseSchema = zod.object({
  id: zod.number().optional(),
  name: zod.string().min(1, { message: 'Zone name is required' }),
  price: zod.number().min(0, { message: 'Price must be positive' }),
  minutes: zod.number().min(1, { message: 'Minutes must be at least 1' }),
  totalSlots: zod.number().min(1, { message: 'Total slots must be at least 1' }),
  availableSlots: zod.number().min(0).optional(),
  status: zod.enum(['active', 'inactive']).default('active'),
  startTime: zod.string().regex(timeRegex, 'Invalid time format (HH:mm)').optional().or(zod.literal('')),
  endTime: zod.string().regex(timeRegex, 'Invalid time format (HH:mm)').optional().or(zod.literal('')),
  parkingId: zod.string().optional(),
  slots: zod.string().optional(),
});

export const addressBaseSchema = zod.object({
  id: zod.number().optional(),
  address1: zod.string().min(1, { message: 'Address 1 is required' }),
  address2: zod.string().optional(),
  city: zod.string().min(1, { message: 'City is required' }),
  state: zod.string().min(1, { message: 'State is required' }),
  country: zod.string().min(1, { message: 'Country is required' }),
  zip: zod.string().min(1, { message: 'ZIP code is required' }),
  status: zod.enum(['active', 'inactive']).optional(),
  latitude: zod.number(),
  longitude: zod.number(),
});

// Request schemas (for create/update)
export const parkingZoneRequestSchema = parkingZoneBaseSchema.extend({
  id: zod.number().optional(),
  parkingId: zod.number().optional(),
  slots: zod.string().optional(),
});
export const addressRequestSchema = addressBaseSchema.extend({
  id: zod.number().optional(),
});
export const locationRequestSchema = zod.object({
  id: zod.number().optional(),
  name: zod.string().min(1, { message: 'Name is required' }),
  isActive: zod.boolean().default(true),
  isArchived: zod.boolean().default(false),
  addressDto: addressRequestSchema,
  parkingZoneDto: zod.array(parkingZoneRequestSchema).min(1, { message: 'At least one parking zone is required' }),
  createdAt: zod.date().optional(),
  updatedAt: zod.date().optional(),
});

// Response schemas (for get)
export const parkingZoneResponseSchema = parkingZoneBaseSchema;
export const addressResponseSchema = addressBaseSchema;
export const locationResponseSchema = zod.object({
  id: zod.number().optional(),
  name: zod.string().min(1, { message: 'Name is required' }),
  isActive: zod.boolean().default(true),
  isArchived: zod.boolean().default(false),
  address: addressResponseSchema,
  parkingZone: zod.array(parkingZoneResponseSchema).min(1, { message: 'At least one parking zone is required' }),
  createdAt: zod.date().optional(),
  updatedAt: zod.date().optional(),
});

// Types
export type ParkingZone = zod.infer<typeof parkingZoneBaseSchema>;
export type Address = zod.infer<typeof addressBaseSchema>;
export type LocationFormData = zod.infer<typeof locationRequestSchema>;
export type LocationResponse = zod.infer<typeof locationResponseSchema>;

export interface ParkingListData {
  parking: LocationResponse[];
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}
