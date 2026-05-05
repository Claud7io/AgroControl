import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
           <img src="/logo.png" alt="AgroControl" className="header-logo-img" />
        </div>
        <h2 className="header-title">AgroControl</h2>
      </div>

      <div className="header-right">
        <button
          className="header-link"
          onClick={() => navigate('/perfil')}
        >
          {usuario?.nombre || 'Perfil'}
        </button>
        <button className="header-link" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Header;
