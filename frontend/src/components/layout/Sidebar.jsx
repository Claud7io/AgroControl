import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, FileText, Building2, Truck, Sprout, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { esAdmin } = useAuth();

  const items = [
    { ruta: '/dashboard', etiqueta: 'Inicio', icono: Home },
    { ruta: '/nuevo-control', etiqueta: 'Nuevo Control', icono: PlusCircle },
    { ruta: '/historial', etiqueta: 'Historial', icono: FileText },
    { ruta: '/proveedores', etiqueta: 'Proveedores', icono: Building2 },
    { ruta: '/camiones', etiqueta: 'Camiones', icono: Truck },
    { ruta: '/variedades', etiqueta: 'Variedades', icono: Sprout },
  ];

  // Añadir gestión de usuarios solo para admin
  if (esAdmin()) {
    items.push({ ruta: '/usuarios', etiqueta: 'Usuarios', icono: Users });
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icono = item.icono;
          return (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
              }
            >
              <Icono size={20} />
              <span>{item.etiqueta}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
