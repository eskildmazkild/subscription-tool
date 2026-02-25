'use client';

import { useState } from 'react';
import AddSubscriptionForm from './AddSubscriptionForm';

interface AddSubscriptionModalProps {
  onSubscriptionAdded: () => void;
}

export default function AddSubscriptionModal({ onSubscriptionAdded }: AddSubscriptionModalProps) {
  const [open, setOpen] = useState(false);

  function handleSuccess() {
    setOpen(false);
    onSubscriptionAdded();
  }

  return (
    <>
      <button
        data-testid="add-subscription-btn"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        + Add Subscription
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Subscription</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <AddSubscriptionForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
