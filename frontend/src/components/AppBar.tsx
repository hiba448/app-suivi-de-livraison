import { useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function MainAppBar() {
  const navigate = useNavigate();

  return (
    <>
      <AppBar position="fixed" className="custom-appbar">
        <Toolbar className="appbar-toolbar">
          <Typography
            variant="h6"
            component="div"
            className="appbar-logo"
            onClick={() => navigate('/')}
          >
            <span className="logo-icon">🚚</span>
            Delivery Service
          </Typography>

          <div className="appbar-links">
            <button className="appbar-link" onClick={() => navigate('/')}>
              Accueil
            </button>

            <button className="appbar-link" onClick={() => navigate('/user')}>
              Utilisateur
            </button>

            <button className="appbar-link" onClick={() => navigate('/driver')}>
              Simulateur
            </button>
          </div>
        </Toolbar>
      </AppBar>

      <Toolbar />
    </>
  );
}
