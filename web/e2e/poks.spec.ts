import { test, expect } from '@playwright/test';
import { setupApiMocks, MOCK_USER, MOCK_POK, type MockPok } from './helpers/mock-api';

test.describe('Create learning', () => {
  test('uses QuickEntry to save a learning and sees it in the feed', async ({ page }) => {
    const NEW_POK = {
      ...MOCK_POK,
      id: 'pok-new',
      title: null,
      content: 'Just learned something interesting today.',
    };

    await setupApiMocks(page, {
      authenticated: true,
      poks: [],
      createdPok: NEW_POK,
    });

    await page.goto('/en/poks');

    // Wait for auth + initial load to settle (empty state)
    await expect(page.getByText(/no learnings yet/i)).toBeVisible();

    // Type into the QuickEntry textarea (aria-label = "What did you learn?")
    await page.getByRole('textbox', { name: /what did you learn/i }).fill(NEW_POK.content);

    // Click the save button
    await page.getByRole('button', { name: /save learning/i }).click();

    // The new learning's heading should appear in the feed (PokCard uses content as header
    // when title is null)
    await expect(page.getByRole('heading', { name: NEW_POK.content })).toBeVisible();

    // Success toast is shown
    await expect(page.getByRole('status')).toContainText(/learning saved successfully/i);
  });
});

test.describe('Edit learning', () => {
  test('edits a learning and is redirected back to the detail page', async ({ page }) => {
    const UPDATED_POK = {
      ...MOCK_POK,
      content: 'Updated content after editing.',
      updatedAt: '2026-01-02T10:00:00Z',
    };

    await setupApiMocks(page, {
      authenticated: true,
      pok: MOCK_POK,
      updatedPok: UPDATED_POK,
    });

    // Go directly to the detail page
    await page.goto(`/en/poks/${MOCK_POK.id}`);
    await expect(page.getByText(MOCK_POK.content)).toBeVisible();

    // Click the Edit link
    await page.getByRole('link', { name: /^edit$/i }).click();
    await expect(page).toHaveURL(/\/en\/poks\/pok-1\/edit/);
    await expect(page.getByRole('heading', { name: /edit learning/i })).toBeVisible();

    // Clear and fill the content field (id="pok-content", label="Content")
    const contentField = page.getByLabel(/^content$/i);
    await contentField.clear();
    await contentField.fill(UPDATED_POK.content);

    // Submit
    await page.getByRole('button', { name: /save changes/i }).click();

    // Success toast appears
    await expect(page.getByRole('status')).toContainText(/learning updated successfully/i);

    // After toast auto-dismisses (3 s), navigates back to the detail page
    await expect(page).toHaveURL(/\/en\/poks\/pok-1$/, { timeout: 10_000 });
  });
});

test.describe('Timeline view', () => {
  test('navigates to the timeline route and shows month-grouped learnings', async ({ page }) => {
    const POK_JAN = { ...MOCK_POK, createdAt: '2026-01-15T10:00:00Z' };
    const POK_FEB = {
      ...MOCK_POK,
      id: 'pok-2',
      title: 'February Learning',
      createdAt: '2026-02-10T10:00:00Z',
      updatedAt: '2026-02-10T10:00:00Z',
    };

    await setupApiMocks(page, { authenticated: true, poks: [POK_FEB, POK_JAN] });
    await page.goto('/en/poks/timeline');

    // Page heading
    await expect(page.getByRole('heading', { name: /timeline/i, level: 1 })).toBeVisible();

    // ViewSwitcher shows Timeline tab as active
    await expect(page.getByRole('tab', { name: /timeline/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Month group headings (locale-aware via Intl.DateTimeFormat)
    await expect(page.getByRole('heading', { name: /january 2026/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /february 2026/i })).toBeVisible();

    // Learning cards visible
    await expect(page.getByRole('heading', { name: MOCK_POK.title! })).toBeVisible();
    await expect(page.getByRole('heading', { name: POK_FEB.title })).toBeVisible();
  });
});

test.describe('Tag-grouped view', () => {
  test('shows learnings grouped by tag when ?view=tags param is active', async ({ page }) => {
    const POK_WITH_TAG: MockPok = {
      ...MOCK_POK,
      tags: [{ id: 'tag-1', name: 'React' }] as MockPok['tags'],
    };

    await setupApiMocks(page, { authenticated: true, poks: [POK_WITH_TAG] });
    await page.goto('/en/poks?view=tags');

    // ViewSwitcher shows Tags tab as active
    await expect(page.getByRole('tab', { name: /tags/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Tag group section heading
    await expect(page.getByRole('heading', { name: 'React' })).toBeVisible();

    // Learning card visible inside the group
    await expect(page.getByRole('heading', { name: MOCK_POK.title! })).toBeVisible();
  });

  test('shows untagged section when learnings have no tags', async ({ page }) => {
    const UNTAGGED_POK: MockPok = { ...MOCK_POK, tags: [] };

    await setupApiMocks(page, { authenticated: true, poks: [UNTAGGED_POK] });
    await page.goto('/en/poks?view=tags');

    // Untagged section heading
    await expect(page.getByRole('heading', { name: /untagged/i })).toBeVisible();

    // Learning card visible
    await expect(page.getByRole('heading', { name: MOCK_POK.title! })).toBeVisible();
  });
});

test.describe('Delete learning', () => {
  test('deletes a learning via the confirmation dialog and returns to the list', async ({
    page,
  }) => {
    await setupApiMocks(page, {
      authenticated: true,
      pok: MOCK_POK,
    });

    // Go directly to the detail page
    await page.goto(`/en/poks/${MOCK_POK.id}`);
    await expect(page.getByText(MOCK_POK.content)).toBeVisible();

    // Click the Delete button — opens confirmation dialog
    await page.getByRole('button', { name: /^delete$/i }).click();

    // Confirmation dialog appears
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/this action cannot be undone/i)).toBeVisible();

    // Confirm deletion using the button inside the dialog
    await dialog.getByRole('button', { name: /^delete$/i }).click();

    // Success toast appears
    await expect(page.getByRole('status')).toContainText(/learning deleted successfully/i);

    // After toast auto-dismisses (3 s), navigates back to the poks list.
    // SearchBar adds ?page=0 on mount, so we match with or without query params.
    await expect(page).toHaveURL(/\/en\/poks(\?|$)/, { timeout: 10_000 });
  });
});
