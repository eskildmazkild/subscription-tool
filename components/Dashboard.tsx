import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import FilteredSubscriptionList from './FilteredSubscriptionList';

async function getCategories(): Promise<string[]> {
  const subs = await prisma.subscription.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });
  return subs.map((s) => s.category);
}

export default async function Dashboard() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        }>
          <FilteredSubscriptionList allCategories={categories} />
        </Suspense>
      </div>
    </main>
  );
}
