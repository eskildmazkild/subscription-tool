'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditSubscriptionModal from '@/components/EditSubscriptionModal';
import { Subscription } from '@/lib/types';

interface EditPageProps {
  params: { id: string };
}

export default function EditSubscriptionPage({ params }: EditPageProps) {
  const { id } = params;
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch(`/api/subscriptions/${id}`);
        if (!res.ok) {
          setError('Subscription not found');
          return;
        }
        const data = await res.json();
        setSub(data);
      } catch (err) {
        setError('Failed to load subscription');
      } finally {
        setLoading(false);
      }
    }
    fetchSubscription();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error || 'Subscription not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <EditSubscriptionModal
          subscription={sub}
          onClose={() => router.push(`/subscriptions/${id}`)}
        />
      </div>
    </div>
  );
}
