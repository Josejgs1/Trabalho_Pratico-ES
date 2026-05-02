import discoverPreview from "../../assets/landing/discover-venue-detail.png";
import explorePreview from "../../assets/landing/explore-map.png";
import ratePreview from "../../assets/landing/rate-review-card.png";
import registerPreview from "../../assets/landing/register-passport.png";

const cards = [
  {
    title: "Explore",
    eyebrow: "Mapa cultural",
    description: "Navegue por museus e galerias no centro de Belo Horizonte.",
    image: explorePreview,
    alt: "Mapa da KULTI com museus e galerias no centro de Belo Horizonte",
  },
  {
    title: "Descubra",
    eyebrow: "Detalhes do local",
    description: "Abra enderecos, contatos, categorias e descricoes completas.",
    image: discoverPreview,
    imagePosition: "center 82%",
    alt: "Detalhes da Casa do Baile abertos na KULTI",
  },
  {
    title: "Registre",
    eyebrow: "Passaporte digital",
    description: "Acompanhe visitas e mantenha sua jornada cultural organizada.",
    image: registerPreview,
    alt: "Passaporte digital da KULTI com locais visitados",
  },
  {
    title: "Avalie",
    eyebrow: "Registro de visita",
    description: "Guarde notas e comentarios sobre os lugares visitados.",
    image: ratePreview,
    alt: "Avaliação da KULTI com nota e comentário",
  },
];

export function LandingShowcase({ layoutIndex }) {
  const activeIndex = layoutIndex % cards.length;

  return (
    <div className="landing-showcase" aria-label="Prévias da KULTI">
      {cards.map((card, index) => {
        const stage = (index - activeIndex + cards.length) % cards.length;

        return (
          <article
            className={`landing-feature-card landing-feature-card--${stage}`}
            key={card.title}
          >
            <div className="landing-feature-copy">
              <p>{card.eyebrow}</p>
              <h2>{card.title}</h2>
              <span>{card.description}</span>
            </div>
            <img
              src={card.image}
              alt={card.alt}
              style={{ objectPosition: card.imagePosition || "top left" }}
            />
          </article>
        );
      })}
    </div>
  );
}
