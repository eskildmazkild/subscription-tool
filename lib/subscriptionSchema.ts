import { z } from 'zod';

export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  cost: z.number().positive('Cost must be positive'),
  billingCycle: z.enum(['monthly', 'yearly']),
  nextBillingDate: z.string().min(1, 'Next billing date is required'),
  status: z.string().optional().default('active'),
  startDate: z.string().optional().nullable(),
  trialEndDate: z.string().optional().nullable(),
  cancellationDate: z.string().optional().nullable(),
  lastActiveDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
