import { test, expect } from '@playwright/test';
import { setupApiMocks, MOCK_USER } from './helpers/mock-api';

test.describe('Settings page', () => {
  test('AC15: renders privacy controls for profileVisibility and defaultPokVisibility', async ({
    page,
  }) => {
    await setupApiMocks(page, {
      authenticated: true,
      user: { ...MOCK_USER, profileVisibility: 'PRIVATE', defaultPokVisibility: 'PRIVATE' },
    });

    await page.goto('/en/settings');

    await expect(page.getByRole('heading', { name: 'Privacy' })).toBeVisible();
    await expect(page.getByLabel(/profile visibility/i)).toBeVisible();
    await expect(page.getByText('Default learning visibility').first()).toBeVisible();
  });

  test('renders "View my profile" link pointing to own profile', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true, user: MOCK_USER });

    await page.goto('/en/settings');

    const profileLink = page.getByRole('link', { name: /view my profile/i });
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toHaveAttribute('href', `/en/learners/${MOCK_USER.handle}`);
  });

  test('saves profileVisibility when selection changes', async ({ page }) => {
    await setupApiMocks(page, { authenticated: true, user: MOCK_USER });

    await page.goto('/en/settings');

    // Select renders role="combobox" — open the profile visibility dropdown and choose Public
    await page.getByRole('combobox', { name: /profile visibility/i }).click();
    await page.getByRole('option', { name: 'Public' }).first().click();

    await expect(page.getByText(/settings saved/i)).toBeVisible();
  });
});
