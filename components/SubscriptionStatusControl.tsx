'use client';

import React from 'react';
import { SubscriptionStatus } from '@/lib/types';
import { STATUS_OPTIONS } from '@/lib/statusMachine';

interface SubscriptionStatusControlProps {
  value: SubscriptionStatus;
  onChange: (status: SubscriptionStatus) => void;
  error?: string;
  disabled?: boolean;
}

export default function SubscriptionStatusControl({
  value,
  onChange,
  error,
  disabled = false,
}: SubscriptionStatusControlProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Status <span className="text-red-500">*</span>
      </label>
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          let selectedClasses = '';
          if (isSelected) {
            switch (option.value) {
              case 'active':
                selectedClasses = 'bg-green-600 text-white border-green-600';
                break;
              case 'free_trial':
                selectedClasses = 'bg-amber-500 text-white border-amber-500';
                break;
              case 'cancelled':
                selectedClasses = 'bg-gray-500 text-white border-gray-500';
                break;
            }
          }
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                isSelected
                  ? selectedClasses
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-pressed={isSelected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
