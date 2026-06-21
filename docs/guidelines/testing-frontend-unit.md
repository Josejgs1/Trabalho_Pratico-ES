[← Back to Index](../INDEX.md)

> Part of the [Guidelines](.) — for E2E tests, see [testing-e2e.md](testing-e2e.md) (coming soon).

# Frontend Unit Testing Guide

How to run and write frontend unit tests for KULTI using Vitest + React Testing Library.

## 1. Run the tests

```bash
cd frontend

# all tests
npx vitest run

# watch mode (re-runs on file change)
npx vitest

# with coverage
npx vitest run --coverage
```

The minimum required coverage is **80%**.

---

## 2. File structure

```
frontend/src/tests/
├── setup.js                # global setup (imports jest-dom matchers)
├── tokenStorage.test.js    # reference: pure utility test
└── authService.test.js     # reference: service test with mocked API
```

Test files live in `src/tests/` and follow the naming pattern `<module>.test.js`.

---

## 3. Patterns

### Pure utility (no mocks needed)

```js
import { describe, it, expect, beforeEach } from "vitest";
import { saveAccessToken, getAccessToken } from "../services/tokenStorage.js";

describe("tokenStorage", () => {
  beforeEach(() => localStorage.clear());

  it("saves and retrieves a token", () => {
    saveAccessToken("my-token");
    expect(getAccessToken()).toBe("my-token");
  });
});
```

### Service module (mock `apiRequest`)

```js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser } from "../services/authService.js";

vi.mock("../services/api.js", () => ({ apiRequest: vi.fn() }));
import { apiRequest } from "../services/api.js";

describe("authService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /auth/login", async () => {
    apiRequest.mockResolvedValue({ access_token: "tok" });
    const result = await loginUser({ email: "a@b.com", password: "pass" });
    expect(apiRequest).toHaveBeenCalledWith("/auth/login", expect.any(Object));
    expect(result.access_token).toBe("tok");
  });
});
```

### Component (React Testing Library)

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MyComponent from "../components/MyComponent.jsx";

describe("MyComponent", () => {
  it("renders the title", () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

---

## See Also

- [ADR-005](../adr/adr-005-testing-strategy.md) — rationale for Vitest + RTL
- [Backend Testing Guide](testing-backend.md) — pytest integration tests
