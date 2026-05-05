import { useState, useEffect } from 'react';
import { controlesAPI, camionesAPI } from '../api/services';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    controles_hoy: 0,
    camiones_hoy: 0,
    porcentaje_aprobados: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const response = await controlesAPI.estadisticasHoy();
      setStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Inicio</h1>

      <div className="divider"></div>

      <h2 className="section-title">Información General</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Controles hoy</p>
          <h3 className="stat-value">
            {cargando ? '...' : stats.controles_hoy || 0}
          </h3>
        </div>

        <div className="stat-card">
          <p className="stat-label">Camiones hoy</p>
          <h3 className="stat-value">
            {cargando ? '...' : stats.camiones_hoy || 0}
          </h3>
        </div>

        <div className="stat-card">
          <p className="stat-label">% Aceptados</p>
          <h3 className="stat-value">
            {cargando ? '...' : `${stats.porcentaje_aprobados || 0}%`}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
