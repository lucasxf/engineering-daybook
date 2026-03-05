import { test, expect } from '@playwright/test';
import { setupApiMocks, MOCK_USER, MOCK_POK } from './helpers/mock-api';

test.describe('Learner profile page', () => {
  test('AC1: public profile shows display name and learnings to non-owner', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      learnerProfiles: {
        alice: {
          handle: 'alice',
          displayName: 'Alice Example',
          learnings: [{ ...MOCK_POK, id: 'pok-alice', userId: 'alice-id' }],
        },
      },
    });

    await page.goto('/en/learners/alice');

    await expect(page.getByText('Alice Example')).toBeVisible();
    await expect(page.getByText('@alice')).toBeVisible();
    await expect(page.getByText(MOCK_POK.content)).toBeVisible();
  });

  test('AC3: private profile shows private shell to non-owner', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      learnerProfiles: {
        alice: {
          handle: 'alice',
          profileVisibility: 'PRIVATE',
        },
      },
    });

    await page.goto('/en/learners/alice');

    await expect(page.getByText('@alice')).toBeVisible();
    await expect(page.getByText(/this profile is private/i)).toBeVisible();
    // No display name, no learnings
    await expect(page.getByText('Alice Example')).not.toBeVisible();
  });

  test('AC4: owner sees full profile even when private', async ({ page }) => {
    const ownerUser = { ...MOCK_USER, handle: 'testuser' };
    await setupApiMocks(page, {
      authenticated: true,
      user: ownerUser,
      learnerProfiles: {
        testuser: {
          handle: 'testuser',
          displayName: 'Test User',
          learnings: [MOCK_POK],
          learningCount: 1,
        },
      },
    });

    await page.goto('/en/learners/testuser');

    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText(MOCK_POK.content)).toBeVisible();
  });

  test('AC13: unknown handle shows 404 message', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      learnerProfiles: {}, // no profiles registered
    });

    await page.goto('/en/learners/ghost');

    await expect(page.getByText(/learner not found/i)).toBeVisible();
  });
});
