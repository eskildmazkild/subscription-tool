import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.subscription.deleteMany();

  await prisma.subscription.createMany({
    data: [
      {
        name: 'Netflix',
        category: 'streaming',
        cost: 15.99,
        billingCycle: 'monthly',
        normalizedMonthlyCost: 15.99,
        status: 'active',
        startDate: '2024-01-01',
        trialEndDate: null,
        cancellationDate: null,
      },
      {
        name: 'Spotify',
        category: 'music',
        cost: 9.99,
        billingCycle: 'monthly',
        normalizedMonthlyCost: 9.99,
        status: 'active',
        startDate: '2024-01-15',
        trialEndDate: null,
        cancellationDate: null,
      },
      {
        name: 'Adobe Creative Cloud',
        category: 'software',
        cost: 599.99,
        billingCycle: 'yearly',
        normalizedMonthlyCost: 50.0,
        status: 'active',
        startDate: '2024-03-01',
        trialEndDate: null,
        cancellationDate: null,
      },
      {
        name: 'Apple TV+',
        category: 'streaming',
        cost: 8.99,
        billingCycle: 'monthly',
        normalizedMonthlyCost: 8.99,
        status: 'free_trial',
        startDate: '2024-06-01',
        trialEndDate: '2024-07-01',
        cancellationDate: null,
      },
    ],
  });

  console.log('Seed data created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
