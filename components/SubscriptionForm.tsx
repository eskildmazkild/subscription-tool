'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SubscriptionFormValues, SubscriptionStatus } from '@/lib/types';
import { isTransitionAllowed } from '@/lib/statusMachine';
import SubscriptionStatusControl from './SubscriptionStatusControl';

// Client-side Zod schema (cost as string from input)
const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category is required'),
    cost: z
      .string()
      .min(1, 'Cost is required')
      .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
        message: 'Cost must be a positive number',
      }),
    billingCycle: z.enum(['monthly', 'yearly']),
    status: z.enum(['active', 'free_trial', 'cancelled']),
    startDate: z.string().min(1, 'Start date is required'),
    trialEndDate: z.string().optional(),
    cancellationDate: z.string().optional(),
    lastActiveDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'free_trial') {
      if (!data.trialEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Trial end date is required for Free Trial',
          path: ['trialEndDate'],
        });
      } else if (data.startDate && data.trialEndDate <= data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Trial end date must be after start date',
          path: ['trialEndDate'],
        });
      }
    }

    if (data.status === 'cancelled') {
      if (!data.cancellationDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cancellation date is required for Cancelled status',
          path: ['cancellationDate'],
        });
      } else if (data.startDate && data.cancellationDate < data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cancellation date cannot be before start date',
          path: ['cancellationDate'],
        });
      }

      if (!data.lastActiveDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Last active date is required for Cancelled status',
          path: ['lastActiveDate'],
        });
      } else if (data.cancellationDate && data.lastActiveDate > data.cancellationDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Last active date cannot be after cancellation date',
          path: ['lastActiveDate'],
        });
      }
    }
  });

type FormSchema = z.infer<typeof formSchema>;

interface SubscriptionFormProps {
  initialValues?: Partial<SubscriptionFormValues>;
  originalStatus?: SubscriptionStatus;
  onSubmit: (values: SubscriptionFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  serverErrors?: Record<string, string>;
}

const CATEGORIES = [
  'Entertainment',
  'Productivity',
  'Health & Fitness',
  'News & Media',
  'Cloud Storage',
  'Music',
  'Gaming',
  'Education',
  'Finance',
  'Other',
];

export default function SubscriptionForm({
  initialValues,
  originalStatus,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
  serverErrors,
}: SubscriptionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      category: initialValues?.category ?? '',
      cost: initialValues?.cost ?? '',
      billingCycle: initialValues?.billingCycle ?? 'monthly',
      status: initialValues?.status ?? 'active',
      startDate: initialValues?.startDate ?? '',
      trialEndDate: initialValues?.trialEndDate ?? '',
      cancellationDate: initialValues?.cancellationDate ?? '',
      lastActiveDate: initialValues?.lastActiveDate ?? '',
    },
  });

  const currentStatus = watch('status') as SubscriptionStatus;
  const [transitionError, setTransitionError] = React.useState<string | null>(null);

  // Apply server errors to form fields
  useEffect(() => {
    if (serverErrors) {
      for (const [field, message] of Object.entries(serverErrors)) {
        setError(field as keyof FormSchema, { type: 'server', message });
      }
    }
  }, [serverErrors, setError]);

  function handleStatusChange(newStatus: SubscriptionStatus) {
    // Check forbidden transition Cancelled → Free Trial
    if (originalStatus === 'cancelled' && newStatus === 'free_trial') {
      setTransitionError(
        'A cancelled subscription cannot be moved back to Free Trial. Set it to Active first.'
      );
      return;
    }

    // Also check current form status for transitions
    const fromStatus = currentStatus;
    if (!isTransitionAllowed(fromStatus, newStatus) && fromStatus !== newStatus) {
      setTransitionError(
        'A cancelled subscription cannot be moved back to Free Trial. Set it to Active first.'
      );
      return;
    }

    setTransitionError(null);

    // Clear stale date fields when switching status
    if (newStatus !== 'free_trial') {
      setValue('trialEndDate', '');
    }
    if (newStatus !== 'cancelled') {
      setValue('cancellationDate', '');
      setValue('lastActiveDate', '');
    }

    setValue('status', newStatus);
  }

  async function handleFormSubmit(data: FormSchema) {
    setTransitionError(null);
    await onSubmit(data as SubscriptionFormValues);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subscription Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="e.g. Netflix"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          {...register('category')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
      </div>

      {/* Cost + Billing Cycle */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost (£) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('cost')}
            placeholder="9.99"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing Cycle <span className="text-red-500">*</span>
          </label>
          <select
            {...register('billingCycle')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.billingCycle && (
            <p className="mt-1 text-sm text-red-600">{errors.billingCycle.message}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <SubscriptionStatusControl
          value={currentStatus}
          onChange={handleStatusChange}
          error={transitionError ?? errors.status?.message}
        />
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register('startDate')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
        )}
      </div>

      {/* Conditional: Trial End Date */}
      {currentStatus === 'free_trial' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trial End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('trialEndDate')}
            className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {errors.trialEndDate && (
            <p className="mt-1 text-sm text-red-600">{errors.trialEndDate.message}</p>
          )}
        </div>
      )}

      {/* Conditional: Cancellation Date + Last Active Date */}
      {currentStatus === 'cancelled' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('cancellationDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.cancellationDate && (
              <p className="mt-1 text-sm text-red-600">{errors.cancellationDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Active Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('lastActiveDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.lastActiveDate && (
              <p className="mt-1 text-sm text-red-600">{errors.lastActiveDate.message}</p>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
