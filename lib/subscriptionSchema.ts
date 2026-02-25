import { z } from 'zod';

export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  cost: z
    .number({ error: 'Cost must be a number' })
    .positive('Cost must be positive'),
  billingCycle: z.enum(['monthly', 'yearly'], {
    errorMap: () => ({ message: 'Billing cycle must be monthly or yearly' }),
  }),
  nextBillingDate: z.string().min(1, 'Next billing date is required'),
  notes: z.string().optional(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
