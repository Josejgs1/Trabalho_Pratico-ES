import { useState } from "react";

import { AuthShell } from "../components/auth/authShell.jsx";
import { RegisterForm } from "../components/auth/registerForm.jsx";
import { registerUser } from "../services/authService.js";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleRegister(user) {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await registerUser(user);
      setSuccess("Account created successfully. You can sign in next.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      ariaLabel="Create account"
      title="Create your account"
      subtitle="Begin your curated journey through museums and galleries"
      footer={
        <>
          Already have an account?{" "}
          <a className="auth-link" href="/login">
            Sign in
          </a>
        </>
      }
    >
      <RegisterForm
        error={error}
        isSubmitting={isSubmitting}
        onSubmit={handleRegister}
        success={success}
      />
    </AuthShell>
  );
}
