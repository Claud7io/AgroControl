import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NuevoControl from './pages/NuevoControl';
import Historial from './pages/Historial';
import Proveedores from './pages/Proveedores';
import Camiones from './pages/Camiones';
import Variedades from './pages/Variedades';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';

function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas con layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nuevo-control" element={<NuevoControl />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/camiones" element={<Camiones />} />
        <Route path="/variedades" element={<Variedades />} />
        <Route path="/perfil" element={<Perfil />} />
        
        {/* Ruta solo admin */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute soloAdmin>
              <Usuarios />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
