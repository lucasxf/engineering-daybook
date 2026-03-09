import { test, expect } from '@playwright/test';
import { setupApiMocks, MOCK_USER, MOCK_POK } from './helpers/mock-api';
import type { MockFeedItem } from './helpers/mock-api';

const FEED_ITEM_OWNED: MockFeedItem = {
  type: 'owned',
  id: 'pok-alice',
  userId: 'alice-id',
  title: "Alice's Learning",
  content: 'Alice learned something interesting.',
  visibility: 'PUBLIC',
  deletedAt: null,
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-01T10:00:00Z',
  tags: [],
  pendingSuggestions: [],
  authorHandle: 'alice',
  authorDisplayName: 'Alice Example',
  authorAvatarUrl: null,
};

const FEED_ITEM_SHARED: MockFeedItem = {
  type: 'shared',
  id: 'share-42',
  originalPokId: MOCK_POK.id,
  originalPok: { ...MOCK_POK, title: 'Original Learning Title', visibility: 'PUBLIC' },
  sharedByHandle: 'bob',
  note: 'Great insight!',
  visibility: 'PUBLIC',
  createdAt: '2026-03-02T12:00:00Z',
  originalAuthorHandle: 'carol',
  originalAuthorDisplayName: 'Carol Example',
  originalAuthorAvatarUrl: null,
};

test.describe('Feed page', () => {
  test('AC1: authenticated user lands on /feed and sees Feed heading', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true, feedItems: [] });
    await page.goto('/en/feed');

    await expect(page).toHaveURL(/\/en\/feed/);
    await expect(page.getByRole('heading', { name: 'Feed', exact: true })).toBeVisible();
  });

  test('AC1 empty state: feed with no followed learners shows empty state with Discover CTA', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true, feedItems: [] });
    await page.goto('/en/feed');

    await expect(page.getByText(/your feed is empty/i)).toBeVisible();
    await expect(page.getByText(/follow learners/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /find learners/i })).toBeVisible();
  });

  test('AC1 empty state: Discover CTA links to /discover', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true, feedItems: [] });
    await page.goto('/en/feed');

    const cta = page.getByRole('link', { name: /find learners/i });
    await expect(cta).toHaveAttribute('href', /\/discover/);
  });

  test('AC2: feed shows owned learning card with author name and title', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      feedItems: [FEED_ITEM_OWNED],
    });
    await page.goto('/en/feed');

    await expect(page.getByText("Alice's Learning")).toBeVisible();
    await expect(page.getByText('Alice Example')).toBeVisible();
  });

  test('AC2: feed shows re-learning card with shared-by and note', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      feedItems: [FEED_ITEM_SHARED],
    });
    await page.goto('/en/feed');

    // ReLearningCard shows re-learned-by handle and the note
    await expect(page.getByText('@bob')).toBeVisible();
    await expect(page.getByText('Great insight!')).toBeVisible();
  });

  test('AC3: author name on feed card links to learner profile', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      feedItems: [FEED_ITEM_OWNED],
    });
    await page.goto('/en/feed');

    // FeedPokCard renders two links to the author's profile (avatar + text); .first() gets either one
    const authorLink = page.getByRole('link', { name: 'Alice Example' }).first();
    await expect(authorLink).toHaveAttribute('href', /\/learners\/alice/);
  });

  test('unauthenticated user is redirected away from /feed', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });
    await page.goto('/en/feed');

    // Middleware redirects unauthenticated users to the login page
    await expect(page).toHaveURL(/\/login/);
  });
});
