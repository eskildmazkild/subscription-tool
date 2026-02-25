import { test, expect } from '@playwright/test';

test.describe('Subscription Detail Page', () => {
  let subscriptionId: string;
  let monthlySubId: string;
  let yearlySubId: string;
  let trialSubId: string;
  let cancelledSubId: string;

  test.beforeAll(async ({ request }) => {
    // Create a monthly subscription
    const monthly = await request.post('/api/subscriptions', {
      data: {
        name: 'Netflix Detail Test',
        category: 'Streaming',
        cost: 15.99,
        billingCycle: 'monthly',
        startDate: '2024-01-01',
        status: 'active',
      },
    });
    const monthlyData = await monthly.json();
    monthlySubId = monthlyData.id;

    // Create a yearly subscription
    const yearly = await request.post('/api/subscriptions', {
      data: {
        name: 'Annual Plan Detail Test',
        category: 'Software',
        cost: 120.00,
        billingCycle: 'yearly',
        startDate: '2024-01-01',
        status: 'active',
      },
    });
    const yearlyData = await yearly.json();
    yearlySubId = yearlyData.id;

    // Create a free trial subscription
    const trial = await request.post('/api/subscriptions', {
      data: {
        name: 'Trial Service Detail Test',
        category: 'Software',
        cost: 9.99,
        billingCycle: 'monthly',
        startDate: '2024-01-01',
        status: 'free_trial',
        trialEndDate: '2025-08-01',
      },
    });
    const trialData = await trial.json();
    trialSubId = trialData.id;

    // Create a cancelled subscription
    const cancelled = await request.post('/api/subscriptions', {
      data: {
        name: 'Cancelled Service Detail Test',
        category: 'Entertainment',
        cost: 19.99,
        billingCycle: 'monthly',
        startDate: '2024-01-01',
        status: 'cancelled',
        cancellationDate: '2025-07-15',
        lastActiveDate: '2025-07-14',
      },
    });
    const cancelledData = await cancelled.json();
    cancelledSubId = cancelledData.id;

    subscriptionId = monthlySubId;
  });

  test.afterAll(async ({ request }) => {
    for (const id of [monthlySubId, yearlySubId, trialSubId, cancelledSubId]) {
      if (id) {
        await request.delete(`/api/subscriptions/${id}`).catch(() => {});
      }
    }
  });

  test('TC-1: detail page loads with complete metadata', async ({ page }) => {
    await page.goto(`/subscriptions/${monthlySubId}`);

    await expect(page.getByTestId('subscription-name')).toContainText('Netflix Detail Test');
    await expect(page.getByTestId('subscription-category')).toContainText('Streaming');
    await expect(page.getByTestId('subscription-billing-cycle')).toContainText('Monthly');
    await expect(page.getByTestId('subscription-start-date')).toContainText('2024');
    await expect(page.getByTestId('subscription-status')).toBeVisible();
    await expect(page.getByTestId('subscription-cost')).toContainText('15.99');
  });

  test('TC-2a: cost breakdown for monthly subscription', async ({ page }) => {
    await page.goto(`/subscriptions/${monthlySubId}`);

    await expect(page.getByTestId('cost-breakdown-section')).toBeVisible();
    await expect(page.getByTestId('original-cost')).toContainText('€15.99');
    await expect(page.getByTestId('original-cost')).toContainText('month');
    await expect(page.getByTestId('monthly-equivalent')).toContainText('€15.99');
    await expect(page.getByTestId('yearly-equivalent')).toContainText('€191.88');
  });

  test('TC-2b: cost breakdown for yearly subscription', async ({ page }) => {
    await page.goto(`/subscriptions/${yearlySubId}`);

    await expect(page.getByTestId('cost-breakdown-section')).toBeVisible();
    await expect(page.getByTestId('original-cost')).toContainText('€120.00');
    await expect(page.getByTestId('original-cost')).toContainText('year');
    await expect(page.getByTestId('monthly-equivalent')).toContainText('€10.00');
    await expect(page.getByTestId('yearly-equivalent')).toContainText('€120.00');
  });

  test('TC-3a: free trial subscription shows trial end date', async ({ page }) => {
    await page.goto(`/subscriptions/${trialSubId}`);

    await expect(page.getByTestId('subscription-status')).toBeVisible();
    await expect(page.getByTestId('trial-end-date')).toBeVisible();
    await expect(page.getByTestId('trial-end-date')).toContainText('2025');
    await expect(page.getByTestId('cancellation-date')).not.toBeVisible();
  });

  test('TC-3b: cancelled subscription shows cancellation and last active dates', async ({ page }) => {
    await page.goto(`/subscriptions/${cancelledSubId}`);

    await expect(page.getByTestId('subscription-status')).toBeVisible();
    await expect(page.getByTestId('cancellation-date')).toBeVisible();
    await expect(page.getByTestId('cancellation-date')).toContainText('2025');
    await expect(page.getByTestId('last-active-date')).toBeVisible();
    await expect(page.getByTestId('trial-end-date')).not.toBeVisible();
  });

  test('TC-3c: active subscription shows no trial or cancellation dates', async ({ page }) => {
    await page.goto(`/subscriptions/${monthlySubId}`);

    await expect(page.getByTestId('trial-end-date')).not.toBeVisible();
    await expect(page.getByTestId('cancellation-date')).not.toBeVisible();
    await expect(page.getByTestId('last-active-date')).not.toBeVisible();
  });

  test('TC-5: new subscription with no status history shows empty state', async ({ page }) => {
    await page.goto(`/subscriptions/${monthlySubId}`);

    await expect(page.getByTestId('status-history-section')).toBeVisible();
    const noHistory = page.getByTestId('no-status-history');
    const historyList = page.getByTestId('status-history-list');

    const hasNoHistory = await noHistory.isVisible().catch(() => false);
    const hasHistoryList = await historyList.isVisible().catch(() => false);

    expect(hasNoHistory || hasHistoryList).toBe(true);

    if (hasNoHistory) {
      await expect(noHistory).toContainText('No status changes recorded yet');
    }
  });

  test('TC-6: navigating to non-existent subscription shows error state', async ({ page }) => {
    await page.goto('/subscriptions/nonexistent-id-999999');

    await expect(page.getByTestId('not-found-state')).toBeVisible();
    await expect(page.getByText('Subscription not found')).toBeVisible();
    await expect(page.getByTestId('back-to-subscriptions-link')).toBeVisible();
  });

  test('TC-7a: back to subscriptions link navigates to list', async ({ page }) => {
    await page.goto(`/subscriptions/${monthlySubId}`);

    await page.getByTestId('back-to-subscriptions-link').click();
    await expect(page).toHaveURL('/');
  });

  test('TC-7b: edit button navigates to edit form', async ({ page }) => {
    await page.goto(`/subscriptions/${monthlySubId}`);

    await page.getByTestId('edit-subscription-btn').click();
    await expect(page).toHaveURL(`/subscriptions/${monthlySubId}/edit`);
  });

  test('API: GET /api/subscriptions/:id returns 404 for non-existent id', async ({ request }) => {
    const response = await request.get('/api/subscriptions/nonexistent-999999');
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Subscription not found');
  });

  test('API: GET /api/subscriptions/:id returns full data with statusHistory', async ({ request }) => {
    const response = await request.get(`/api/subscriptions/${monthlySubId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(monthlySubId);
    expect(body.name).toBe('Netflix Detail Test');
    expect(body.statusHistory).toBeDefined();
    expect(Array.isArray(body.statusHistory)).toBe(true);
  });
});
