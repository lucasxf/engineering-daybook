import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';

test.describe('Support page', () => {
  test('AC1: EN support page renders with h1 and no 404', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });
    await page.goto('/en/support');

    await expect(page.getByRole('heading', { name: 'Support' })).toBeVisible();
    await expect(page.locator('text=404')).toHaveCount(0);
  });

  test('AC2: PT-BR support page renders with h1', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });
    await page.goto('/pt-BR/support');

    await expect(page.getByRole('heading', { name: 'Suporte' })).toBeVisible();
  });

  test('AC3: Contact mailto link is visible on EN page', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });
    await page.goto('/en/support');

    await expect(page.locator('a[href="mailto:support@learnimo.net"]')).toBeVisible();
  });

  test('AC4: All 5 FAQ entries present on EN page, including GitHub link', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });
    await page.goto('/en/support');

    // Delete account FAQ
    await expect(page.getByText(/delete/i).first()).toBeVisible();

    // Change handle FAQ
    await expect(page.getByText(/handle/i).first()).toBeVisible();

    // Data privacy FAQ
    await expect(page.getByText(/privacy|data/i).first()).toBeVisible();

    // Theme / language FAQ
    await expect(page.getByText(/theme|language/i).first()).toBeVisible();

    // Report bug FAQ
    await expect(page.getByText(/bug|report/i).first()).toBeVisible();

    // GitHub issues link
    await expect(page.locator('a[href*="issues/new"]')).toBeVisible();
  });

  test('AC5: All 5 FAQ entries present on PT-BR page, including GitHub link', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });
    await page.goto('/pt-BR/support');

    // Delete account FAQ (PT-BR: "conta")
    await expect(page.getByText(/conta/i).first()).toBeVisible();

    // Change handle FAQ (PT-BR: "usuário" / "nome de usuário")
    await expect(page.getByText(/usu.rio/i).first()).toBeVisible();

    // Data privacy FAQ (PT-BR: "dados")
    await expect(page.getByText(/dados/i).first()).toBeVisible();

    // Theme / language FAQ (PT-BR: "tema" or "idioma")
    await expect(page.getByText(/tema|idioma/i).first()).toBeVisible();

    // Report bug FAQ (PT-BR: "bug" or "issue")
    await expect(page.getByText(/bug|issue/i).first()).toBeVisible();

    // GitHub issues link
    await expect(page.locator('a[href*="issues/new"]')).toBeVisible();
  });

  test('AC6: Support page accessible without login — no redirect to /login', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });
    await page.goto('/en/support');

    // Must stay on /support, not redirect to /login
    await expect(page).toHaveURL(/\/en\/support/);
    await expect(page.getByRole('heading', { name: 'Support' })).toBeVisible();
  });

  test('AC7: Footer contains links to /support and /privacy', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });
    await page.goto('/en/privacy');

    const footer = page.getByRole('contentinfo');
    await expect(footer.locator('a[href*="/support"]')).toBeVisible();
    await expect(footer.locator('a[href*="/privacy"]')).toBeVisible();
  });
});
