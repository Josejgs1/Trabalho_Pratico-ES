import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

export function RegisterForm({ error, isSubmitting, onSubmit, success }) {
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
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span>Name</span>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>
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
          minLength="8"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </label>
      {error && <p className="auth-message auth-message-error">{error}</p>}
      {success && <p className="auth-message auth-message-success">{success}</p>}
      <button className="auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
