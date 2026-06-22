import { expect, test } from "@playwright/test";

import {
  authenticatePage,
  createAuthenticatedUser,
  fetchFirstVenue,
} from "./helpers.js";

test("user can record a visit", async ({ page, request }) => {
  const { user, token } = await createAuthenticatedUser(request, "record");
  const venue = await fetchFirstVenue(request, token);
  const comment = `E2E visit ${Date.now()}`;

  await authenticatePage(page, token);
  await page.goto("/map");
  await expect(page.getByRole("button", { name: "Meu Passaporte" })).toBeVisible();

  await page.getByPlaceholder("Busque por museus, galerias...").fill(venue.name);
  await page.getByRole("option").filter({ hasText: venue.name }).first().click();
  await expect(page.getByRole("heading", { name: venue.name })).toBeVisible();

  await page.getByRole("button", { name: "Registrar visita" }).click();
  await expect(page.getByRole("heading", { name: "Nova Avaliação" })).toBeVisible();
  await expect(page.getByPlaceholder("Busque um museu...")).toHaveValue(venue.name);
  await page.getByRole("button", { name: "Nota 5" }).click();
  await page.getByPlaceholder("Conte sua opinião...").fill(comment);
  const [createRecordResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes("/records/") &&
      response.request().method() === "POST"
    ),
    page.getByRole("button", { name: "Criar" }).click(),
  ]);

  const record = await createRecordResponse.json();
  expect(createRecordResponse.status()).toBe(201);
  expect(record).toMatchObject({
    user_id: user.id,
    venue_id: venue.id,
    rating: 5,
    comment,
  });
  expect(record.id).toBeTruthy();

  await expect(page.getByRole("button", { name: "Editar avaliação" })).toBeVisible();

  await page.getByRole("button", { name: "Meu Passaporte" }).click();
  await expect(page).toHaveURL(/\/passport/, { timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Visitados" })).toBeVisible();
  await expect(page.getByRole("heading", { name: venue.name })).toBeVisible();
  await expect(page.getByText("5 / 5")).toBeVisible();
  await expect(page.getByText(comment)).toBeVisible();
});
