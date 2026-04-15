import { KultiLogo } from "../brand/kultiLogo.jsx";

const heroImage =
  "https://images.unsplash.com/photo-1752718069156-0367b18ae4ef?auto=format&fit=crop&w=1080&q=80";

export function AuthShell({ ariaLabel, children, footer, subtitle, title }) {
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

      <section className="auth-form-panel" aria-label={ariaLabel}>
        <div className="auth-card">
          <div className="auth-logo">
            <KultiLogo className="h-16 w-16" />
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </section>
    </main>
  );
}
