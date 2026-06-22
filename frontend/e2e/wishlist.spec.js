import { expect, test } from "@playwright/test";

import {
  authenticatePage,
  createAuthenticatedUser,
  fetchFirstVenue,
} from "./helpers.js";

test("user can add a venue to wishlist", async ({ page, request }) => {
  const { user, token } = await createAuthenticatedUser(request, "wishlist");
  const venue = await fetchFirstVenue(request, token);

  await authenticatePage(page, token);
  await page.goto("/map");
  await expect(page.getByRole("button", { name: "Meu Passaporte" })).toBeVisible();

  await page.getByPlaceholder("Busque por museus, galerias...").fill(venue.name);
  await page.getByRole("option").filter({ hasText: venue.name }).first().click();
  await expect(page.getByRole("heading", { name: venue.name })).toBeVisible();

  const [addWishlistResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes("/wishlists/") &&
      response.request().method() === "POST"
    ),
    page.getByRole("button", { name: "Adicionar à wishlist" }).click(),
  ]);

  const wishlistItem = await addWishlistResponse.json();
  expect(addWishlistResponse.status()).toBe(201);
  expect(wishlistItem).toMatchObject({
    user_id: user.id,
    venue_id: venue.id,
  });
  expect(wishlistItem.id).toBeTruthy();
  await expect(
    page.getByRole("button", { name: "Remover da wishlist" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Meu Passaporte" }).click();
  await expect(page).toHaveURL(/\/passport/, { timeout: 10_000 });
  await page.getByRole("button", { name: "Quero visitar" }).click();
  await expect(page.getByRole("heading", { name: venue.name })).toBeVisible();
  await expect(page.getByText(venue.category, { exact: true })).toBeVisible();
  await expect(page.getByText(venue.address, { exact: true })).toBeVisible();
});
