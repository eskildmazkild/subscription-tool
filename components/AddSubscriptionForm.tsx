'use client';

import React, { useState } from 'react';
import { SubscriptionFormValues } from '@/lib/types';
import SubscriptionForm from './SubscriptionForm';

interface AddSubscriptionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddSubscriptionForm({ onSuccess, onCancel }: AddSubscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string> | undefined>();

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

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
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
    } catch (error) {
      console.error('Failed to create subscription:', error);
      setServerErrors({ _global: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SubscriptionForm
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Add Subscription"
      serverErrors={serverErrors}
    />
  );
}
