import { useNavigate } from 'react-router-dom';

import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Home() {
  const navigate = useNavigate();

  function HomeCard({
    pageName,
    title,
    description,
    Icon,
  }: {
    pageName: string;
    title: string;
    description: string;
    Icon: any;
  }) {
    return (
      <button className="home-card" onClick={() => navigate(`/${pageName}`)}>
        <div className="home-card-icon">
          <Icon fontSize="large" />
        </div>

        <div className="home-card-content">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <div className="home-card-arrow">
          <ArrowForwardIcon />
        </div>
      </button>
    );
  }

  return (
    <section className="home-page">
      <div className="home-hero">
        <span className="home-badge">Suivi de livraison en temps réel</span>

        <h1>Bienvenue sur Delivery Service</h1>

        <p>
          Créez une demande de livraison, suivez son évolution sur une carte
          interactive et visualisez les mises à jour en temps réel.
        </p>
      </div>

      <div className="home-actions">
        <HomeCard
          pageName="user"
          title="Espace utilisateur"
          description="Créer une livraison et suivre son avancement en direct."
          Icon={PersonIcon}
        />

        <HomeCard
          pageName="driver"
          title="Simulateur livreur"
          description="Recevoir une demande, l'accepter et simuler le déplacement."
          Icon={LocalShippingIcon}
        />
      </div>
    </section>
  );
}