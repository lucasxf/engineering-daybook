import { test, expect } from '@playwright/test';
import { setupApiMocks, MOCK_USER, MOCK_POK } from './helpers/mock-api';

test.describe('Auth redirect', () => {
  test('unauthenticated user visiting /poks is redirected to /login', async ({ page }) => {
    await setupApiMocks(page, { authenticated: false });

    await page.goto('/en/poks');

    await expect(page).toHaveURL(/\/en\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });
});

test.describe('Login flow', () => {
  test('fills login form, submits, and lands on the feed', async ({ page }) => {
    // Initial state: unauthenticated. After a successful login, AuthProvider sets the
    // user in React state (via setUser) — it does NOT re-call /auth/me. So we only
    // need the login endpoint mocked (plus /poks for when the feed loads afterward).
    await setupApiMocks(page, {
      authenticated: false,
      loginResponse: MOCK_USER,
      poks: [MOCK_POK],
    });

    await page.goto('/en/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('Password1!');
    await page.getByRole('button', { name: /^log in$/i }).click();

    // LoginForm calls router.push('/en/poks') on success
    await expect(page).toHaveURL(/\/en\/poks/);
    await expect(page.getByRole('heading', { name: /my learnings/i })).toBeVisible();

    // The logged-in user's handle appears in the header
    await expect(page.getByText(`@${MOCK_USER.handle}`)).toBeVisible();
  });
});
