import { useState } from "react";

const initialForm = {
  email: "",
  password: "",
};

export function LoginForm({ error, isSubmitting, onSubmit, success }) {
  const [formData, setFormData] = useState(initialForm);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>
      <label className="auth-field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </label>
      {error && <p className="auth-message auth-message-error">{error}</p>}
      {success && <p className="auth-message auth-message-success">{success}</p>}
      <button className="auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
