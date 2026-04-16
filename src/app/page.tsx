import { ButtonLink, Card, Text } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="dashboard-layout">
      <Card as="section" className="hero-card">
        <Text as="p" className="kicker">
          SocialDeck Platform
        </Text>
        <h1 className="hero-title">
          Publie une image ou une video sur plusieurs reseaux sociaux en un seul flux.
        </h1>
        <Text as="p" className="hero-copy">
          SocialDeck combine un frontend Next.js, une API backend integree, MySQL et une file de publication
          avec planification. Tu peux connecter tes comptes via OAuth2 et piloter toute ta diffusion depuis
          un tableau de bord unique.
        </Text>

        <div className="hero-actions">
          {user ? (
            <>
              <ButtonLink href="/dashboard" size="big">
                Ouvrir le dashboard
              </ButtonLink>
              <ButtonLink href="/settings" variant="outline" size="big">
                Configurer les comptes
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/register" size="big">
                Commencer gratuitement
              </ButtonLink>
              <ButtonLink href="/login" variant="outline" size="big">
                J&apos;ai deja un compte
              </ButtonLink>
            </>
          )}
        </div>
      </Card>

      <section className="landing-grid">
        <Card as="article" className="landing-feature">
          <h2 className="section-title">Comptes et securite</h2>
          <Text as="p" className="section-subtitle">
            Inscription et connexion securisees, gestion de profil utilisateur, sessions HTTP-only.
          </Text>
        </Card>

        <Card as="article" className="landing-feature">
          <h2 className="section-title">OAuth2 multi-plateformes</h2>
          <Text as="p" className="section-subtitle">
            LinkedIn, Instagram, Facebook, Threads, Pinterest, YouTube et Google Business.
          </Text>
        </Card>

        <Card as="article" className="landing-feature">
          <h2 className="section-title">Creation et publication</h2>
          <Text as="p" className="section-subtitle">
            Upload image/video, selection des plateformes, personnalisation par reseau, publication immediate
            ou planifiee.
          </Text>
        </Card>

        <Card as="article" className="landing-feature">
          <h2 className="section-title">Suivi des resultats</h2>
          <Text as="p" className="section-subtitle">
            Historique des posts, statut succes/echec, traces des tentatives de publication.
          </Text>
        </Card>
      </section>
    </div>
  );
}
