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

describe("auth forms", () => {
  it("normalizes and submits login data", () => {
    const onSubmit = vi.fn();
    render(
      <LoginForm
        error="Credenciais inválidas"
        isSubmitting={false}
        onSubmit={onSubmit}
        success="Bem-vindo"
      />,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: " USER@Example.COM " },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret123",
    });
    expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
    expect(screen.getByText("Bem-vindo")).toBeInTheDocument();
  });

  it("normalizes and submits registration data", () => {
    const onSubmit = vi.fn();
    render(
      <RegisterForm
        error=""
        isSubmitting={true}
        onSubmit={onSubmit}
        success="Conta criada"
      />,
    );

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: " Ada Lovelace " },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: " ADA@KULTI.COM " },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Criando conta..." }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      email: "ada@kulti.com",
      password: "password123",
    });
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Conta criada")).toBeInTheDocument();
  });
});

