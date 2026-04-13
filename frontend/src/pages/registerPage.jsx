import { useState } from "react";

import { RegisterForm } from "../components/auth/registerForm.jsx";
import { KultiLogo } from "../components/brand/kultiLogo.jsx";
import { registerUser } from "../services/authService.js";

const heroImage =
  "https://images.unsplash.com/photo-1752718069156-0367b18ae4ef?auto=format&fit=crop&w=1080&q=80";

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
    <main className="auth-page">
      <section className="auth-visual-panel" aria-label="KULTI visual reference">
        <div>
          <img
            src={heroImage}
            alt="Celadon pottery displayed in a museum"
            className="auth-visual-image"
          />
        </div>
      </section>

      <section className="auth-form-panel" aria-label="Create account">
        <div className="auth-card">
          <div className="auth-logo">
            <KultiLogo className="h-16 w-16" />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Begin your curated journey through museums and galleries
          </p>
          <RegisterForm
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={handleRegister}
            success={success}
          />
          <p className="auth-footer">
            Already have an account?{" "}
            <a className="auth-link" href="/login">
              Sign in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
