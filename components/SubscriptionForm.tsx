'use client';

import { useState, useEffect } from 'react';
import { BillingCycle, SubscriptionStatus, Subscription, SubscriptionFormValues } from '@/lib/types';
import { normalizeToMonthly } from '@/lib/utils';

interface SubscriptionFormProps {
  initialValues?: Subscription;
  onSubmit: (values: SubscriptionFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  mode: 'create' | 'edit';
}

const DEFAULT_VALUES: SubscriptionFormValues = {
  name: '',
  category: '',
  cost: '',
  billingCycle: 'monthly',
  status: 'active',
  startDate: '',
  trialEndDate: '',
  cancellationDate: '',
  lastActiveDate: '',
};

const CATEGORIES = [
  'Streaming',
  'Music',
  'Software',
  'Gaming',
  'News',
  'Fitness',
  'Education',
  'Productivity',
  'Storage',
  'Other',
];

export default function SubscriptionForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  mode,
}: SubscriptionFormProps) {
  const [values, setValues] = useState<SubscriptionFormValues>(() => {
    if (initialValues) {
      return {
        name: initialValues.name,
        category: initialValues.category,
        cost: String(initialValues.cost),
        billingCycle: initialValues.billingCycle,
        status: initialValues.status,
        startDate: initialValues.startDate,
        trialEndDate: initialValues.trialEndDate ?? '',
        cancellationDate: initialValues.cancellationDate ?? '',
        lastActiveDate: initialValues.lastActiveDate ?? '',
      };
    }
    return DEFAULT_VALUES;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SubscriptionFormValues, string>>>({});
  const [monthlyPreview, setMonthlyPreview] = useState<number | null>(null);

  // Recalculate monthly preview whenever cost or billing cycle changes
  useEffect(() => {
    const costNum = parseFloat(values.cost);
    if (!isNaN(costNum) && costNum >= 0) {
      setMonthlyPreview(normalizeToMonthly(costNum, values.billingCycle));
    } else {
      setMonthlyPreview(null);
    }
  }, [values.cost, values.billingCycle]);

  function validate(): boolean {
    const newErrors: Partial<Record<keyof SubscriptionFormValues, string>> = {};

    if (!values.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!values.category.trim()) {
      newErrors.category = 'Category is required';
    }

    const costNum = parseFloat(values.cost);
    if (values.cost.trim() === '') {
      newErrors.cost = 'Cost is required';
    } else if (isNaN(costNum) || costNum < 0) {
      newErrors.cost = 'Cost must be a positive number';
    } else if (!/^\d+(\.\d{1,2})?$/.test(values.cost.trim())) {
      newErrors.cost = 'Cost must have at most 2 decimal places';
    }

    if (!values.billingCycle) {
      newErrors.billingCycle = 'Billing cycle is required';
    }

    if (!values.status) {
      newErrors.status = 'Status is required';
    }

    if (!values.startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    } else if (isNaN(Date.parse(values.startDate))) {
      newErrors.startDate = 'Start date must be a valid date';
    } else {
      const startDate = new Date(values.startDate);

      if (values.cancellationDate.trim()) {
        if (isNaN(Date.parse(values.cancellationDate))) {
          newErrors.cancellationDate = 'Cancellation date must be a valid date';
        } else if (new Date(values.cancellationDate) < startDate) {
          newErrors.cancellationDate = 'Cancellation date must not precede start date';
        }
      }

      if (values.trialEndDate.trim()) {
        if (isNaN(Date.parse(values.trialEndDate))) {
          newErrors.trialEndDate = 'Trial end date must be a valid date';
        } else if (new Date(values.trialEndDate) < startDate) {
          newErrors.trialEndDate = 'Trial end date must not precede start date';
        }
      }

      if (values.lastActiveDate.trim()) {
        if (isNaN(Date.parse(values.lastActiveDate))) {
          newErrors.lastActiveDate = 'Last active date must be a valid date';
        } else if (new Date(values.lastActiveDate) < startDate) {
          newErrors.lastActiveDate = 'Last active date must not precede start date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  function handleChange<K extends keyof SubscriptionFormValues>(
    field: K,
    value: SubscriptionFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  const inputClass = (field: keyof SubscriptionFormValues) =>
    `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field]
        ? 'border-red-400 bg-red-50 focus:ring-red-400'
        : 'border-gray-300 bg-white'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Submit Error */}
      {submitError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g. Netflix"
          className={inputClass('name')}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={values.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className={inputClass('category')}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Cost + Billing Cycle */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Cost (€) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            placeholder="0.00"
            className={inputClass('cost')}
          />
          {errors.cost && (
            <p className="mt-1 text-xs text-red-600">{errors.cost}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Billing Cycle <span className="text-red-500">*</span>
          </label>
          <select
            value={values.billingCycle}
            onChange={(e) => handleChange('billingCycle', e.target.value as BillingCycle)}
            className={inputClass('billingCycle')}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.billingCycle && (
            <p className="mt-1 text-xs text-red-600">{errors.billingCycle}</p>
          )}
        </div>
      </div>

      {/* Monthly Cost Preview */}
      {monthlyPreview !== null && (
        <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Monthly equivalent:{' '}
          <span className="font-semibold">
            €{monthlyPreview.toFixed(2)}/month
          </span>
        </div>
      )}

      {/* Status */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          value={values.status}
          onChange={(e) => handleChange('status', e.target.value as SubscriptionStatus)}
          className={inputClass('status')}
        >
          <option value="active">Active</option>
          <option value="free_trial">Free Trial</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-xs text-red-600">{errors.status}</p>
        )}
      </div>

      {/* Start Date */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Start Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={values.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className={inputClass('startDate')}
        />
        {errors.startDate && (
          <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
        )}
      </div>

      {/* Trial End Date (shown when status is free_trial) */}
      {values.status === 'free_trial' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Trial End Date
          </label>
          <input
            type="date"
            value={values.trialEndDate}
            onChange={(e) => handleChange('trialEndDate', e.target.value)}
            className={inputClass('trialEndDate')}
          />
          {errors.trialEndDate && (
            <p className="mt-1 text-xs text-red-600">{errors.trialEndDate}</p>
          )}
        </div>
      )}

      {/* Cancellation Date + Last Active Date (shown when status is cancelled) */}
      {values.status === 'cancelled' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cancellation Date
            </label>
            <input
              type="date"
              value={values.cancellationDate}
              onChange={(e) => handleChange('cancellationDate', e.target.value)}
              className={inputClass('cancellationDate')}
            />
            {errors.cancellationDate && (
              <p className="mt-1 text-xs text-red-600">{errors.cancellationDate}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Last Active Date
            </label>
            <input
              type="date"
              value={values.lastActiveDate}
              onChange={(e) => handleChange('lastActiveDate', e.target.value)}
              className={inputClass('lastActiveDate')}
            />
            {errors.lastActiveDate && (
              <p className="mt-1 text-xs text-red-600">{errors.lastActiveDate}</p>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Add Subscription'}
        </button>
      </div>
    </form>
  );
}
