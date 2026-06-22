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

import { readStoredAccessToken, uniqueEmail } from "./helpers.js";

test("user can register a new account", async ({ page }) => {
  const email = uniqueEmail("register");

  await page.goto("/register");

  await page.getByLabel("Nome").fill("E2E Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill("securepassword");

  const registerResponsePromise = page.waitForResponse((response) =>
    response.url().includes("/auth/register") &&
    response.request().method() === "POST"
  );
  const loginResponsePromise = page.waitForResponse((response) =>
    response.url().includes("/auth/login") &&
    response.request().method() === "POST"
  );

  await page.getByRole("button", { name: "Criar conta" }).click();

  const registerResponse = await registerResponsePromise;
  const registeredUser = await registerResponse.json();
  expect(registerResponse.status()).toBe(201);
  expect(registeredUser).toMatchObject({
    name: "E2E Tester",
    email,
    is_active: true,
  });
  expect(registeredUser.password).toBeUndefined();
  expect(registeredUser.password_hash).toBeUndefined();

  const loginResponse = await loginResponsePromise;
  const auth = await loginResponse.json();
  expect(loginResponse.status()).toBe(200);
  expect(auth.token_type).toBe("bearer");
  expect(auth.access_token).toBeTruthy();
  expect(auth.user.email).toBe(email);

  await expect(page).toHaveURL(/\/map/, { timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Meu Passaporte" })).toBeVisible();
  await expect.poll(() => readStoredAccessToken(page)).toBe(auth.access_token);
});
