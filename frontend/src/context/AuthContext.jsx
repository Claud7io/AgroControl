import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar, recuperar sesión guardada
  useEffect(() => {
    const token = localStorage.getItem('agrocontrol_token');
    const userGuardado = localStorage.getItem('agrocontrol_user');

    if (token && userGuardado) {
      try {
        setUsuario(JSON.parse(userGuardado));
      } catch (error) {
        console.error('Error al recuperar sesión:', error);
        localStorage.removeItem('agrocontrol_token');
        localStorage.removeItem('agrocontrol_user');
      }
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, usuario: userData } = response.data;

      localStorage.setItem('agrocontrol_token', token);
      localStorage.setItem('agrocontrol_user', JSON.stringify(userData));
      setUsuario(userData);

      return { exito: true };
    } catch (error) {
      return {
        exito: false,
        mensaje: error.response?.data?.error || 'Error al iniciar sesión',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('agrocontrol_token');
    localStorage.removeItem('agrocontrol_user');
    setUsuario(null);
  };

  const esAdmin = () => usuario?.rol === 'administrador';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        login,
        logout,
        esAdmin,
        autenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
