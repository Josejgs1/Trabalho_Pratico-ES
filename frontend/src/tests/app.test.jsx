import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../pages/landingPage.jsx", () => ({
  default: () => <div>Landing page</div>,
}));
vi.mock("../pages/loginPage.jsx", () => ({
  default: () => <div>Login page</div>,
}));
vi.mock("../pages/registerPage.jsx", () => ({
  default: () => <div>Register page</div>,
}));
vi.mock("../pages/mapPage.jsx", () => ({
  default: () => <div>Map page</div>,
}));
vi.mock("../pages/passportPage.tsx", () => ({
  default: () => <div>Passport page</div>,
}));
vi.mock("../components/auth/protectedPage.jsx", () => ({
  ProtectedPage: ({ children }) => <section>Protected {children}</section>,
}));

import App from "../app.jsx";

function setPath(pathname) {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { pathname, search: "" },
  });
}

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["/", "Landing page"],
    ["/login", "Login page"],
    ["/register", "Register page"],
    ["/unknown", "Landing page"],
  ])("renders the public route for %s", (pathname, text) => {
    setPath(pathname);

    render(<App />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it.each([
    ["/map", "Map page"],
    ["/passport", "Passport page"],
  ])("wraps private route %s with ProtectedPage", (pathname, text) => {
    setPath(pathname);

    render(<App />);

    expect(screen.getByText("Protected")).toBeInTheDocument();
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
