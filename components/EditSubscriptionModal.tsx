'use client';

import React, { useState } from 'react';
import { Subscription, SubscriptionFormValues } from '@/lib/types';
import SubscriptionForm from './SubscriptionForm';

interface EditSubscriptionModalProps {
  subscription: Subscription;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSubscriptionModal({
  subscription,
  isOpen,
  onClose,
  onSuccess,
}: EditSubscriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string> | undefined>();

  if (!isOpen) return null;

  const initialValues: SubscriptionFormValues = {
    name: subscription.name,
    category: subscription.category,
    cost: String(subscription.cost),
    billingCycle: subscription.billingCycle,
    status: subscription.status,
    startDate: subscription.startDate,
    trialEndDate: subscription.trialEndDate ?? '',
    cancellationDate: subscription.cancellationDate ?? '',
    lastActiveDate: subscription.lastActiveDate ?? '',
  };

  async function handleSubmit(values: SubscriptionFormValues) {
    setIsSubmitting(true);
    setServerErrors(undefined);

    try {
      const payload = {
        name: values.name,
        category: values.category,
        cost: parseFloat(values.cost),
        billingCycle: values.billingCycle,
        status: values.status,
        startDate: values.startDate,
        trialEndDate: values.status === 'free_trial' ? values.trialEndDate || null : null,
        cancellationDate: values.status === 'cancelled' ? values.cancellationDate || null : null,
        lastActiveDate: values.status === 'cancelled' ? values.lastActiveDate || null : null,
      };

      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setServerErrors(data.errors as Record<string, string>);
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update subscription:', error);
      setServerErrors({ _global: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Subscription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">
          <SubscriptionForm
            initialValues={initialValues}
            originalStatus={subscription.status}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            serverErrors={serverErrors}
          />
        </div>
      </div>
    </div>
  );
}
