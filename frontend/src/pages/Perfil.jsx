import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import './Perfil.css';

const Perfil = () => {
  const { usuario } = useAuth();

  if (!usuario) return null;

  return (
    <div className="perfil-page">
      <h1 className="page-title">Mi Perfil</h1>
      <div className="divider"></div>

      <div className="perfil-card">
        <div className="perfil-avatar">
          <User size={64} />
        </div>

        <h2 className="perfil-nombre">{usuario.nombre}</h2>

        <div className="perfil-info">
          <div className="perfil-fila">
            <Mail size={20} />
            <div>
              <span className="perfil-label">Email</span>
              <span className="perfil-valor">{usuario.email}</span>
            </div>
          </div>

          <div className="perfil-fila">
            <Shield size={20} />
            <div>
              <span className="perfil-label">Rol</span>
              <span className="perfil-valor">
                {usuario.rol === 'administrador' ? 'Administrador' : 'Operario'}
              </span>
            </div>
          </div>

          <div className="perfil-fila">
            <Calendar size={20} />
            <div>
              <span className="perfil-label">ID Usuario</span>
              <span className="perfil-valor">#{usuario.id_usuario}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
