import { test, expect } from '@playwright/test';
import { setupApiMocks, MOCK_USER } from './helpers/mock-api';
import type { MockLearnerSearchResult } from './helpers/mock-api';

const ALICE_RESULT: MockLearnerSearchResult = {
  handle: 'alice',
  displayName: 'Alice Example',
  avatarUrl: null,
  bio: 'Learning every day.',
  relationship: 'NONE',
};

const BOB_RESULT: MockLearnerSearchResult = {
  handle: 'bob',
  displayName: 'Bob Builder',
  avatarUrl: null,
  bio: null,
  relationship: 'FOLLOWING',
};

test.describe('Discover page', () => {
  test('AC9: authenticated user sees Discover page with search input', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true });
    await page.goto('/en/discover');

    await expect(page).toHaveURL(/\/en\/discover/);
    await expect(page.getByRole('heading', { name: 'Discover', exact: true })).toBeVisible();
    // input[type="search"] has ARIA role "searchbox"
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('AC9: prompt to type at least 2 characters shown before searching', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true });
    await page.goto('/en/discover');

    await expect(page.getByText(/type at least 2 character/i)).toBeVisible();
  });

  test('AC9: typing 1 character does not trigger search (still shows min-chars hint)', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true, learnerSearchResults: [ALICE_RESULT] });
    await page.goto('/en/discover');

    await page.getByRole('searchbox').fill('a');

    // Results should not appear; hint should still be visible
    await expect(page.getByText(/type at least 2 character/i)).toBeVisible();
    await expect(page.getByText('Alice Example')).not.toBeVisible();
  });

  test('AC9: typing 2+ characters shows search results', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      learnerSearchResults: [ALICE_RESULT],
    });
    await page.goto('/en/discover');

    await page.getByRole('searchbox').fill('al');

    await expect(page.getByText('Alice Example')).toBeVisible();
    await expect(page.getByText('@alice')).toBeVisible();
  });

  test('AC9: learner bio is shown in result card', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      learnerSearchResults: [ALICE_RESULT],
    });
    await page.goto('/en/discover');

    await page.getByRole('searchbox').fill('al');

    await expect(page.getByText('Learning every day.')).toBeVisible();
  });

  test('AC10: Follow button shown for learner with NONE relationship', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      learnerSearchResults: [ALICE_RESULT],
    });
    await page.goto('/en/discover');

    await page.getByRole('searchbox').fill('al');

    await expect(page.getByRole('button', { name: /^follow$/i })).toBeVisible();
  });

  test('AC10: Following shown for learner already followed', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      learnerSearchResults: [BOB_RESULT],
    });
    await page.goto('/en/discover');

    await page.getByRole('searchbox').fill('bo');

    // Following status shows "Unfollow @bob" aria-label (visually says "Following")
    await expect(page.getByRole('button', { name: /unfollow @bob/i })).toBeVisible();
  });

  test('AC9: no results state when backend returns empty list', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      learnerSearchResults: [],
    });
    await page.goto('/en/discover');

    await page.getByRole('searchbox').fill('xyz');

    await expect(page.getByText(/no learners found/i)).toBeVisible();
  });

  test('AC9: result card links to learner profile', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      learnerSearchResults: [ALICE_RESULT],
    });
    await page.goto('/en/discover');

    await page.getByRole('searchbox').fill('al');

    const profileLink = page.getByRole('link', { name: "View Alice Example's profile" });
    await expect(profileLink).toHaveAttribute('href', /\/learners\/alice/);
  });

  test('unauthenticated user is redirected away from /discover', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });
    await page.goto('/en/discover');

    // Middleware redirects unauthenticated users to the login page
    await expect(page).toHaveURL(/\/login/);
  });
});
