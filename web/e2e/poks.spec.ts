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

    // Month group headings — MonthGroup uses year: '2-digit' ("January 26" not "January 2026")
    // level: 2 narrows to <h2> month group headings, excluding <h3> POK title headings
    await expect(page.getByRole('heading', { name: /january/i, level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /february/i, level: 2 })).toBeVisible();

    // Learning cards visible
    await expect(page.getByRole('heading', { name: MOCK_POK.title! })).toBeVisible();
    await expect(page.getByRole('heading', { name: POK_FEB.title })).toBeVisible();
  });
});

test.describe('Tag-grouped view', () => {
  test('shows learnings grouped by tag when ?view=tags param is active', async ({ page }) => {
    const POK_WITH_TAG: MockPok = {
      ...MOCK_POK,
      // TagGroupedView reads tag.tagId and tag.displayName (not id/name)
      tags: [{ tagId: 'tag-1', displayName: 'React' }] as MockPok['tags'],
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

test.describe('Semantic search', () => {
  test('search always sends searchMode=hybrid in the API request', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true, poks: [MOCK_POK] });
    await page.goto('/en/poks');

    // Wait for the feed to render
    await expect(page.getByRole('heading', { name: MOCK_POK.title! })).toBeVisible();

    // Capture the debounced search request — Promise.all avoids the race condition where
    // waitForRequest is registered AFTER fill fires the debounced request.
    // Must match the API host (localhost:8080) to avoid capturing Next.js RSC navigation
    // requests to localhost:3001/en/poks?keyword=... which also match '/poks' + 'keyword'.
    const [req] = await Promise.all([
      page.waitForRequest(
        (r) =>
          r.url().startsWith('http://localhost:8080/api/v1/poks') &&
          r.method() === 'GET' &&
          new URL(r.url()).searchParams.has('keyword'),
        { timeout: 10000 },
      ),
      page.getByRole('textbox', { name: /search your learnings/i }).fill('react'),
    ]);
    const url = new URL(req.url());
    expect(url.searchParams.get('searchMode')).toBe('hybrid');
  });

  test('empty search state shows semantic-aware hint', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true, poks: [] });
    await page.goto('/en/poks?keyword=nonexistent');

    await expect(
      page.getByText(/try rephrasing your search/i),
    ).toBeVisible();
  });
});

test.describe('Visibility', () => {
  test('detail page shows Public badge for a public learning', async ({ page }) => {
    const PUBLIC_POK: MockPok = { ...MOCK_POK, visibility: 'PUBLIC' };
    await setupApiMocks(page, { authenticated: true, pok: PUBLIC_POK });
    await page.goto(`/en/poks/${PUBLIC_POK.id}`);

    // VisibilityBadge renders "🌐 Public" for PUBLIC learnings
    await expect(page.getByText(/🌐/)).toBeVisible();
  });

  test('detail page shows Private badge for a private learning', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true, pok: MOCK_POK });
    await page.goto(`/en/poks/${MOCK_POK.id}`);

    // VisibilityBadge renders "🔒 Private" for PRIVATE learnings
    await expect(page.getByText(/🔒/)).toBeVisible();
  });

  test('feed shows PUBLIC badge on card for public learnings', async ({ page }) => {
    const PUBLIC_POK: MockPok = { ...MOCK_POK, id: 'pok-public', visibility: 'PUBLIC' };

    await setupApiMocks(page, { authenticated: true, poks: [PUBLIC_POK] });
    await page.goto('/en/poks');

    // Public learning card shows 🌐 badge
    await expect(page.getByText(/🌐/)).toBeVisible();
  });

  test('QuickEntry creates a PUBLIC learning when user selects Public visibility', async ({
    page,
  }) => {
    const PUBLIC_POK: MockPok = {
      ...MOCK_POK,
      id: 'pok-public-new',
      content: 'This is a public learning.',
      visibility: 'PUBLIC',
    };

    await setupApiMocks(page, {
      authenticated: true,
      poks: [],
      createdPok: PUBLIC_POK,
    });

    await page.goto('/en/poks');
    await expect(page.getByText(/no learnings yet/i)).toBeVisible();

    // Open visibility picker (combobox labeled "Visibility") and select PUBLIC
    await page.getByRole('combobox', { name: /visibility/i }).click();
    await page.getByRole('option', { name: /public/i }).click();

    // Irreversibility warning should appear
    await expect(page.getByText(/cannot be made private/i)).toBeVisible();

    // Fill content and save
    await page.getByRole('textbox', { name: /what did you learn/i }).fill(PUBLIC_POK.content);
    await page.getByRole('button', { name: /save learning/i }).click();

    // The new learning card in the feed should show the PUBLIC badge
    await expect(page.getByText(/🌐/)).toBeVisible();
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
