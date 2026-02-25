'use client';

import { useState } from 'react';
import { Subscription, SubscriptionFormValues } from '@/lib/types';
import SubscriptionForm from './SubscriptionForm';

interface EditSubscriptionModalProps {
  subscription: Subscription;
  onClose: () => void;
  onUpdated: (updated: Subscription) => void;
}

export default function EditSubscriptionModal({
  subscription,
  onClose,
  onUpdated,
}: EditSubscriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(values: SubscriptionFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        name: values.name,
        category: values.category,
        cost: parseFloat(values.cost),
        billingCycle: values.billingCycle,
        status: values.status,
        startDate: values.startDate,
        trialEndDate: values.trialEndDate.trim() || null,
        cancellationDate: values.cancellationDate.trim() || null,
        lastActiveDate: values.lastActiveDate.trim() || null,
      };

      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { errors?: Record<string, string>; error?: string };
        const message =
          data.error ||
          (data.errors ? Object.values(data.errors).join(', ') : null) ||
          'Failed to save changes. Please try again.';
        setSubmitError(message);
        return;
      }

      const data = (await response.json()) as { subscription: Subscription };
      onUpdated(data.subscription);
      onClose();
    } catch {
      setSubmitError('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Subscription</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
          <SubscriptionForm
            mode="edit"
            initialValues={subscription}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      </div>
    </div>
  );
}
