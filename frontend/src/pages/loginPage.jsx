import { useState } from "react";

import { AuthShell } from "../components/auth/authShell.jsx";
import { LoginForm } from "../components/auth/loginForm.jsx";
import { loginUser } from "../services/authService.js";
import { saveAccessToken } from "../services/tokenStorage.js";

function loginRedirectPath() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");

  if (next?.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return "/map";
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleLogin(credentials) {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const auth = await loginUser(credentials);
      saveAccessToken(auth.access_token);
      setSuccess(`Bem-vindo de volta, ${auth.user.name}.`);
      window.location.replace(loginRedirectPath());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      ariaLabel="Entrar"
      title="Bem-vindo de volta"
      subtitle="Continue sua jornada cultural pela KULTI"
      footer={
        <>
          Novo na KULTI?{" "}
          <a className="auth-link" href="/register">
            Crie uma conta
          </a>
        </>
      }
    >
      <LoginForm
        error={error}
        isSubmitting={isSubmitting}
        onSubmit={handleLogin}
        success={success}
      />
    </AuthShell>
  );
}
