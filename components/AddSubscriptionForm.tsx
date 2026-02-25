'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Subscription } from '@/lib/types';

const CATEGORIES = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'music', label: 'Music' },
  { value: 'software', label: 'Software' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'news', label: 'News' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'education', label: 'Education' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'other', label: 'Other' },
];

const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category is required'),
    cost: z
      .string()
      .min(1, 'Cost is required')
      .refine((val) => !isNaN(Number(val)), { message: 'Cost must be a number greater than 0' })
      .refine((val) => Number(val) > 0, { message: 'Cost must be a number greater than 0' }),
    billingCycle: z.enum(['monthly', 'yearly'], {
      errorMap: () => ({ message: 'Billing cycle is required' }),
    }),
    startDate: z.string().min(1, 'Start date is required'),
    status: z.enum(['active', 'free_trial', 'cancelled'], {
      errorMap: () => ({ message: 'Status is required' }),
    }),
    trialEndDate: z.string().optional(),
    cancellationDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'free_trial') {
      if (!data.trialEndDate || data.trialEndDate.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Trial end date is required for Free Trial status',
          path: ['trialEndDate'],
        });
      } else if (data.startDate && data.trialEndDate < data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Trial end date must be on or after the start date',
          path: ['trialEndDate'],
        });
      }
    }
    if (data.status === 'cancelled') {
      if (!data.cancellationDate || data.cancellationDate.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cancellation date is required for Cancelled status',
          path: ['cancellationDate'],
        });
      } else if (data.startDate && data.cancellationDate < data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cancellation date must be on or after the start date',
          path: ['cancellationDate'],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface AddSubscriptionFormProps {
  onSuccess: (subscription: Subscription) => void;
  onCancel: () => void;
}

export default function AddSubscriptionForm({ onSuccess, onCancel }: AddSubscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [monthlyCostHint, setMonthlyCostHint] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      category: '',
      cost: '',
      billingCycle: undefined,
      startDate: '',
      status: undefined,
      trialEndDate: '',
      cancellationDate: '',
    },
  });

  const watchedStatus = watch('status');
  const watchedBillingCycle = watch('billingCycle');
  const watchedCost = watch('cost');

  // Clear conditional date fields when status changes
  useEffect(() => {
    if (watchedStatus !== 'free_trial') {
      setValue('trialEndDate', '');
    }
    if (watchedStatus !== 'cancelled') {
      setValue('cancellationDate', '');
    }
  }, [watchedStatus, setValue]);

  // Compute monthly cost hint
  useEffect(() => {
    if (watchedBillingCycle === 'yearly' && watchedCost) {
      const cost = Number(watchedCost);
      if (!isNaN(cost) && cost > 0) {
        const monthly = Math.round((cost / 12) * 100) / 100;
        setMonthlyCostHint(`≈ €${monthly.toFixed(2)} / month`);
      } else {
        setMonthlyCostHint(null);
      }
    } else {
      setMonthlyCostHint(null);
    }
  }, [watchedBillingCycle, watchedCost]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        category: data.category,
        cost: Math.round(Number(data.cost) * 100) / 100,
        billingCycle: data.billingCycle,
        startDate: data.startDate,
        status: data.status,
      };

      if (data.status === 'free_trial' && data.trialEndDate) {
        payload.trialEndDate = data.trialEndDate;
      }
      if (data.status === 'cancelled' && data.cancellationDate) {
        payload.cancellationDate = data.cancellationDate;
      }

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        const result = (await response.json()) as { subscription: Subscription };
        onSuccess(result.subscription);
        return;
      }

      if (response.status === 422) {
        const result = (await response.json()) as { errors: Record<string, string> };
        let firstField: keyof FormValues | null = null;
        for (const [field, message] of Object.entries(result.errors)) {
          if (field !== '_root') {
            setError(field as keyof FormValues, { type: 'server', message });
            if (!firstField) firstField = field as keyof FormValues;
          } else {
            setServerError(message);
          }
        }
        if (firstField) setFocus(firstField);
        return;
      }

      setServerError('An unexpected error occurred. Please try again.');
    } catch {
      setServerError('Failed to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = () => {
    // Focus first invalid field
    const fieldOrder: (keyof FormValues)[] = [
      'name',
      'category',
      'cost',
      'billingCycle',
      'startDate',
      'status',
      'trialEndDate',
      'cancellationDate',
    ];
    for (const field of fieldOrder) {
      if (errors[field]) {
        setFocus(field);
        break;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <div className="space-y-5">
        {serverError && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g. Netflix"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            {...register('category')}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.category ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Cost */}
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
            Cost <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">€</span>
            <input
              id="cost"
              type="number"
              step="0.01"
              min="0.01"
              {...register('cost')}
              className={`block w-full rounded-md border pl-7 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cost ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
          </div>
          {monthlyCostHint && (
            <p className="mt-1 text-xs text-blue-600">{monthlyCostHint}</p>
          )}
          {errors.cost && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.cost.message}
            </p>
          )}
        </div>

        {/* Billing Cycle */}
        <div>
          <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-700 mb-1">
            Billing Cycle <span className="text-red-500">*</span>
          </label>
          <select
            id="billingCycle"
            {...register('billingCycle')}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.billingCycle ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select billing cycle</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.billingCycle && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.billingCycle.message}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            id="startDate"
            type="date"
            {...register('startDate')}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startDate ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            {...register('status')}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.status ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="free_trial">Free Trial</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Trial End Date — conditional */}
        {watchedStatus === 'free_trial' && (
          <div>
            <label htmlFor="trialEndDate" className="block text-sm font-medium text-gray-700 mb-1">
              Trial End Date <span className="text-red-500">*</span>
            </label>
            <input
              id="trialEndDate"
              type="date"
              {...register('trialEndDate')}
              className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.trialEndDate ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.trialEndDate && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.trialEndDate.message}
              </p>
            )}
          </div>
        )}

        {/* Cancellation Date — conditional */}
        {watchedStatus === 'cancelled' && (
          <div>
            <label htmlFor="cancellationDate" className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Date <span className="text-red-500">*</span>
            </label>
            <input
              id="cancellationDate"
              type="date"
              {...register('cancellationDate')}
              className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cancellationDate ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cancellationDate && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.cancellationDate.message}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Add Subscription'}
          </button>
        </div>
      </div>
    </form>
  );
}
