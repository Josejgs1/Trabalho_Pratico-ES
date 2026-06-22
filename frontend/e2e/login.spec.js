import { expect, test } from "@playwright/test";

import { createUser, readStoredAccessToken } from "./helpers.js";

test("user can login and load the map", async ({ page, request }) => {
  const user = await createUser(request, "login");

  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Senha").fill(user.password);

  const loginResponsePromise = page.waitForResponse((response) =>
    response.url().includes("/auth/login") &&
    response.request().method() === "POST"
  );

  await page.getByRole("button", { name: "Entrar" }).click();

  const loginResponse = await loginResponsePromise;
  const auth = await loginResponse.json();
  expect(loginResponse.status()).toBe(200);
  expect(auth.token_type).toBe("bearer");
  expect(auth.access_token).toBeTruthy();
  expect(auth.user.email).toBe(user.email);

  await expect(page).toHaveURL(/\/map/, { timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Meu Passaporte" })).toBeVisible();
  await expect.poll(() => readStoredAccessToken(page)).toBe(auth.access_token);
});
