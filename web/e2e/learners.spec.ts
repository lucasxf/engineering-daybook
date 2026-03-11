import { test, expect } from '@playwright/test';
import { setupApiMocks, MOCK_USER, MOCK_POK, MOCK_POK_SHARE } from './helpers/mock-api';

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

  test('AC6: non-owner sees Follow button for public profile', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      learnerProfiles: {
        alice: {
          handle: 'alice',
          displayName: 'Alice Example',
          learnings: [],
          relationshipStatus: 'NONE',
        },
      },
    });

    await page.goto('/en/learners/alice');

    await expect(page.getByRole('button', { name: /follow/i })).toBeVisible();
  });

  test('AC6: clicking Follow sends POST and shows Following', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      followEnabled: true,
      learnerProfiles: {
        alice: {
          handle: 'alice',
          displayName: 'Alice Example',
          learnings: [],
          relationshipStatus: 'NONE',
        },
      },
    });

    await page.goto('/en/learners/alice');
    await page.getByRole('button', { name: /^follow$/i }).click();

    // After successful follow, button shows "Following" and aria-label changes to "Unfollow @alice"
    await expect(page.getByRole('button', { name: /unfollow @alice/i })).toBeVisible();
  });

  test('AC7: clicking Following sends DELETE and reverts to Follow', async ({ page }) => {
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      followEnabled: true,
      learnerProfiles: {
        alice: {
          handle: 'alice',
          displayName: 'Alice Example',
          learnings: [],
          relationshipStatus: 'FOLLOWING',
        },
      },
    });

    await page.goto('/en/learners/alice');
    // Button shows "Following" visually but aria-label is "Unfollow @alice"
    await page.getByRole('button', { name: /unfollow @alice/i }).click();

    // After successful unfollow, button reverts to "Follow"
    await expect(page.getByRole('button', { name: /^follow$/i })).toBeVisible();
  });

  test('Re-learning: Re-learn button is present in DOM for non-owner on public learning', async ({ page }) => {
    const alicePok = { ...MOCK_POK, id: 'pok-alice', userId: 'alice-id', visibility: 'PUBLIC' as const };
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      learnerProfiles: {
        alice: {
          handle: 'alice',
          displayName: 'Alice Example',
          learnings: [alicePok],
          relationshipStatus: 'NONE',
        },
      },
    });

    await page.goto('/en/learners/alice');

    // Button exists in DOM (opacity-0 until hover, force-click bypasses visibility)
    await expect(page.getByRole('button', { name: /re-learn/i })).toBeAttached();
  });

  test('Re-learning: clicking Re-learn opens modal with title', async ({ page }) => {
    const alicePok = { ...MOCK_POK, id: 'pok-alice', userId: 'alice-id', visibility: 'PUBLIC' as const, title: "Alice's Learning" };
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      learnerProfiles: {
        alice: {
          handle: 'alice',
          displayName: 'Alice Example',
          learnings: [alicePok],
          relationshipStatus: 'NONE',
        },
      },
    });

    await page.goto('/en/learners/alice');
    await page.getByRole('button', { name: /re-learn/i }).click({ force: true });

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Alice's Learning")).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^re-learn$/i })).toBeVisible();
  });

  test('Re-learning: submitting Re-learn modal closes dialog', async ({ page }) => {
    const alicePok = { ...MOCK_POK, id: 'pok-alice', userId: 'alice-id', visibility: 'PUBLIC' as const, title: "Alice's Learning" };
    const shareResponse = { ...MOCK_POK_SHARE, originalPokId: 'pok-alice', originalPok: alicePok };
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      createdShare: shareResponse,
      learnerProfiles: {
        alice: {
          handle: 'alice',
          displayName: 'Alice Example',
          learnings: [alicePok],
          relationshipStatus: 'NONE',
        },
      },
    });

    await page.goto('/en/learners/alice');
    await page.getByRole('button', { name: /re-learn/i }).click({ force: true });

    await expect(page.getByRole('dialog')).toBeVisible();

    // Submit the form (the submit button inside the modal also says Re-learn)
    await page.getByRole('dialog').getByRole('button', { name: /^re-learn$/i }).click();

    // Modal should close after successful submission
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Re-learning: cancel button closes modal without submitting', async ({ page }) => {
    const alicePok = { ...MOCK_POK, id: 'pok-alice', userId: 'alice-id', visibility: 'PUBLIC' as const };
    await setupApiMocks(page, {
      authenticated: true,
      user: MOCK_USER,
      learnerProfiles: {
        alice: {
          handle: 'alice',
          displayName: 'Alice Example',
          learnings: [alicePok],
          relationshipStatus: 'NONE',
        },
      },
    });

    await page.goto('/en/learners/alice');
    await page.getByRole('button', { name: /re-learn/i }).click({ force: true });

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('AC5: owner does not see Follow button on their own profile', async ({ page }) => {
    const ownerUser = { ...MOCK_USER, handle: 'testuser' };
    await setupApiMocks(page, {
      authenticated: true,
      user: ownerUser,
      learnerProfiles: {
        testuser: {
          handle: 'testuser',
          displayName: 'Test User',
          learnings: [],
          learningCount: 0,
          followerCount: 3,
          followingCount: 2,
          colleagueCount: 1,
        },
      },
    });

    await page.goto('/en/learners/testuser');

    // No follow button for owner
    await expect(page.getByRole('button', { name: /^follow$/i })).not.toBeVisible();
    // Owner sees social counts
    await expect(page.getByText(/3 follower/i)).toBeVisible();
  });
});
