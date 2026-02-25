import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.subscription.deleteMany();

  await prisma.subscription.createMany({
    data: [
      {
        name: 'Netflix',
        category: 'Streaming',
        cost: 10,
        billingCycle: 'monthly',
        status: 'active',
        startDate: '2024-01-01',
        trialEndDate: null,
        cancellationDate: null,
      },
      {
        name: 'Spotify Annual',
        category: 'Streaming',
        cost: 120,
        billingCycle: 'yearly',
        status: 'active',
        startDate: '2024-01-01',
        trialEndDate: null,
        cancellationDate: null,
      },
      {
        name: 'Gym Membership',
        category: 'Fitness',
        cost: 30,
        billingCycle: 'monthly',
        status: 'active',
        startDate: '2024-03-01',
        trialEndDate: null,
        cancellationDate: null,
      },
      {
        name: 'GitHub Copilot',
        category: 'Software',
        cost: 20,
        billingCycle: 'monthly',
        status: 'trial',
        startDate: '2025-07-01',
        trialEndDate: '2025-08-01',
        cancellationDate: null,
      },
      {
        name: 'Old Service',
        category: 'Software',
        cost: 15,
        billingCycle: 'monthly',
        status: 'cancelled',
        startDate: '2023-01-01',
        trialEndDate: null,
        cancellationDate: '2024-06-01',
      },
    ],
  });

  console.log('Seeded database successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
