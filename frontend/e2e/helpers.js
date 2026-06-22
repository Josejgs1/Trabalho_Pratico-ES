export function uniqueEmail(prefix) {
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}_${suffix}@test.com`;
}

export async function createUser(request, prefix = "e2e") {
  const user = {
    name: "E2E Tester",
    email: uniqueEmail(prefix),
    password: "securepassword",
  };
  const response = await request.post("/auth/register", { data: user });
  if (!response.ok()) {
    throw new Error(`Failed to create E2E user: ${response.status()}`);
  }
  const createdUser = await response.json();
  if (createdUser.email !== user.email || createdUser.name !== user.name) {
    throw new Error("Registered E2E user response does not match the request.");
  }
  return { ...user, id: createdUser.id };
}

export async function loginUser(request, user) {
  const response = await request.post("/auth/login", {
    data: { email: user.email, password: user.password },
  });
  if (!response.ok()) {
    throw new Error(`Failed to login E2E user: ${response.status()}`);
  }
  const auth = await response.json();
  if (!auth.access_token || auth.user?.email !== user.email) {
    throw new Error("E2E login response did not return the expected user token.");
  }
  return auth;
}

export async function createAuthenticatedUser(request, prefix = "e2e") {
  const user = await createUser(request, prefix);
  const auth = await loginUser(request, user);
  return { user, token: auth.access_token };
}

export async function authenticatePage(page, token) {
  await page.addInitScript((accessToken) => {
    window.localStorage.setItem("kulti_access_token", accessToken);
  }, token);
}

export async function readStoredAccessToken(page) {
  return page.evaluate(() => window.localStorage.getItem("kulti_access_token"));
}

export async function fetchFirstVenue(request, token) {
  const response = await request.get("/venues", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok()) {
    throw new Error(`Failed to fetch venues: ${response.status()}`);
  }
  const venues = await response.json();
  if (venues.length === 0) {
    throw new Error("No venues available. Seed the backend database before E2E.");
  }
  return venues[0];
}
