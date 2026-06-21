[← Back to Index](../INDEX.md)

> Part of the [Guidelines](.) — for unit tests, see [testing-frontend-unit.md](testing-frontend-unit.md).

# E2E Testing Guide (Playwright)

How to run and write end-to-end tests for KULTI using Playwright.

## Prerequisites

- Chrome installed on your machine
- Backend running (`cd backend && uvicorn app.main:app --reload`)
- Frontend running (`cd frontend && npm run dev`)

If you don't have Chrome, install the bundled browser instead:
```bash
npx playwright install chromium
```
Then remove `channel: "chrome"` from `playwright.config.js`.

## 1. Run the tests

```bash
cd frontend

# headless (CI-friendly)
npx playwright test

# with browser visible (for debugging)
npx playwright test --headed

# interactive UI mode (good for presentations)
npx playwright test --ui
```

## 2. File structure

```
frontend/
├── playwright.config.js    # base URL, browser channel, webServer
└── e2e/
    └── register.spec.js    # reference: registration flow
```

Each E2E flow gets its own spec file: `login.spec.js`, `record.spec.js`, `wishlist.spec.js`.

## 3. The pattern

```js
import { test, expect } from "@playwright/test";

test("description of the user flow", async ({ page }) => {
  // 1. Navigate
  await page.goto("/some-page");

  // 2. Interact (prefer accessible selectors)
  await page.getByLabel("Email").fill("user@test.com");
  await page.getByRole("button", { name: "Submit" }).click();

  // 3. Assert
  await expect(page.getByText("Success")).toBeVisible();
});
```

Key rules:
- **Use accessible selectors** — `getByLabel`, `getByRole`, `getByText` over CSS selectors.
- **Each test is independent** — don't assume state from a previous test.
- **Use unique data** — generate unique emails/names with `Date.now()` to avoid conflicts.
- **Keep it to 4 total tests** — that's the assignment requirement.

## 4. The 4 E2E tests to implement

1. User registration (reference already done)
2. Login + map loads
3. Record a visit
4. Add to wishlist

## See Also

- [ADR-005](../adr/adr-005-testing-strategy.md) — rationale for Playwright over Cypress
- [Frontend Unit Testing Guide](testing-frontend-unit.md) — Vitest + RTL
