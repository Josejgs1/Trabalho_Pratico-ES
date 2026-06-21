import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthShell } from "../components/auth/authShell.jsx";
import { LoginForm } from "../components/auth/loginForm.jsx";
import { ProtectedPage } from "../components/auth/protectedPage.jsx";
import { RegisterForm } from "../components/auth/registerForm.jsx";

vi.mock("../services/authService.js", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("../services/tokenStorage.js", () => ({
  clearAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

import { getCurrentUser } from "../services/authService.js";
import {
  clearAccessToken,
  getAccessToken,
} from "../services/tokenStorage.js";

describe("AuthShell", () => {
  it("renders the visual panel and form content", () => {
    render(
      <AuthShell
        ariaLabel="Login"
        footer="Ainda não tem conta?"
        subtitle="Entre para continuar"
        title="Entrar"
      >
        <button type="button">Continuar</button>
      </AuthShell>,
    );

    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByLabelText("Login")).toBeInTheDocument();
    expect(screen.getByAltText("Cerâmica celadon em exposição")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });
});

