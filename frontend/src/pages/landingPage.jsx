import { useEffect, useState } from "react";
import { SignIn, UserPlus } from "@phosphor-icons/react";

import { KultiLogo } from "../components/brand/kultiLogo.jsx";
import { LandingShowcase } from "../components/landing/landingShowcase.jsx";
import "../styles/landingPage.css";
import "../styles/landingHero.css";
import "../styles/landingShowcase.css";
import "../styles/landingShowcaseResponsive.css";

export default function LandingPage() {
  const [layoutIndex, setLayoutIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLayoutIndex((current) => current + 1);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="/" aria-label="Início da KULTI">
          <KultiLogo className="landing-brand-icon" />
          <span>KULTI</span>
        </a>
        <nav className="landing-links" aria-label="Navegação pública">
          <a href="/login">Entrar</a>
          <a className="landing-nav-cta" href="/register">
            Criar conta
          </a>
        </nav>
      </header>

      <section className="landing-hero">
        <LandingShowcase layoutIndex={layoutIndex} />
        <div className="landing-hero-shade" />
        <div className="landing-hero-content">
          <p className="landing-kicker">O SEU PASSAPORTE DIGITAL</p>
          <h1>KULTI</h1>
          <p className="landing-copy">
            Explore museus e galerias, acompanhe seu passaporte cultural e
            registre os lugares que marcaram sua rota.
          </p>
          <div className="landing-actions">
            <a className="landing-primary" href="/register">
              <UserPlus size={18} weight="regular" />
              Criar conta
            </a>
            <a className="landing-secondary" href="/login">
              <SignIn size={18} weight="regular" />
              Entrar
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
