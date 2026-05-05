import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login, autenticado } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (autenticado) {
      navigate('/dashboard');
    }
  }, [autenticado, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const resultado = await login(email, password);

    if (resultado.exito) {
      navigate('/dashboard');
    } else {
      setError(resultado.mensaje);
    }

    setCargando(false);
  };

  return (
    <div className="login-page">
      {/* Header con logo */}
      <header className="login-header">
        <div className="login-logo-circle">
          <img src="/logo.png" alt="AgroControl" className="login-logo-img" />
        </div>
        <h1 className="login-header-title">
          AgroControl – Sistema de Control de Calidad
        </h1>
      </header>

      {/* Formulario centrado */}
      <main className="login-main">
        <h2 className="login-title">Iniciar Sesión</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-fields">
            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="Ingrese su email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-buttons">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => alert('Función no implementada en esta versión')}
            >
              ¿Olvidaste contraseña?
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={cargando}
            >
              {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;
