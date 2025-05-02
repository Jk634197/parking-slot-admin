import { z as zod } from 'zod';

export const userSchema = zod.object({
  id: zod.number(),
  firstName: zod.string().min(1, { message: 'First name is required' }),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  phone: zod.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' }),
  email: zod.string().email({ message: 'Invalid email format' }).optional(),
  createdOn: zod.date(),
  createdBy: zod.number(),
  isActive: zod.boolean(),
  isArchived: zod.boolean(),
  userId: zod.number(),
});

export const signInCredentialsSchema = zod.object({
  phone: zod.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' }),
});

export const signInResponseSchema = zod.object({
  token: zod.string(),
  user: userSchema,
});

export const verifyOtpResponseSchema = userSchema.extend({
  token: zod.string(),
});

export type User = zod.infer<typeof userSchema>;
export type SignInCredentials = zod.infer<typeof signInCredentialsSchema>;
export type SignInResponse = zod.infer<typeof signInResponseSchema>;
export type VerifyOtpResponse = zod.infer<typeof verifyOtpResponseSchema>;
