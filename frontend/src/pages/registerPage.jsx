import { useState } from "react";

import { AuthShell } from "../components/auth/authShell.jsx";
import { RegisterForm } from "../components/auth/registerForm.jsx";
import { loginUser, registerUser } from "../services/authService.js";
import { saveAccessToken } from "../services/tokenStorage.js";

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
      const auth = await loginUser({
        email: user.email,
        password: user.password,
      });
      saveAccessToken(auth.access_token);
      setSuccess("Conta criada com sucesso. Abrindo seu mapa.");
      window.location.replace("/map");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      ariaLabel="Criar conta"
      title="Crie sua conta"
      subtitle="Comece sua jornada por museus e galerias"
      footer={
        <>
          Já tem uma conta?{" "}
          <a className="auth-link" href="/login">
            Entrar
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
