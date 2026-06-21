/**
 * Reference E2E test: user registration flow.
 *
 * Pattern:
 * 1. Navigate to the page
 * 2. Fill form fields using accessible labels/placeholders
 * 3. Submit
 * 4. Assert the expected outcome (redirect, success message, etc.)
 *
 * Prerequisites: backend + frontend running locally.
 * Run: npx playwright test
 */

import { test, expect } from "@playwright/test";

const uniqueEmail = () => `e2e_${Date.now()}@test.com`;

test("user can register a new account", async ({ page }) => {
  await page.goto("/register");

  await page.getByLabel("Nome").fill("E2E Tester");
  await page.getByLabel("Email").fill(uniqueEmail());
  await page.getByLabel("Senha").fill("securepassword");
  await page.getByRole("button", { name: "Criar conta" }).click();

  // After successful registration, user is redirected to the map
  await expect(page).toHaveURL(/\/map/, { timeout: 5000 });
});
