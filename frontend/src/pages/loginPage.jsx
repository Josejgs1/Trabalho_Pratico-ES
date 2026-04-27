import { useState } from "react";

import { AuthShell } from "../components/auth/authShell.jsx";
import { LoginForm } from "../components/auth/loginForm.jsx";
import { loginUser } from "../services/authService.js";
import { saveAccessToken } from "../services/tokenStorage.js";

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
      window.location.replace("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      ariaLabel="Sign in"
      title="Welcome back"
      subtitle="Return to your curated cultural journey"
      footer={
        <>
          New to KULTI?{" "}
          <a className="auth-link" href="/register">
            Create an account
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
