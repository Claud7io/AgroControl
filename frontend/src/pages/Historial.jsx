import { useState, useEffect } from 'react';
import { Calendar, Building2, Sprout, CheckCircle, XCircle, Clock } from 'lucide-react';
import { controlesAPI, proveedoresAPI } from '../api/services';
import './Historial.css';

const Historial = () => {
  const [controles, setControles] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtros, setFiltros] = useState({
    fecha: '',
    proveedor: '',
    resultado: '',
  });

  useEffect(() => {
    cargarProveedores();
    cargarControles();
  }, []);

  const cargarProveedores = async () => {
    try {
      const response = await proveedoresAPI.obtenerTodos();
      setProveedores(response.data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const cargarControles = async (params = {}) => {
    setCargando(true);
    try {
      const response = await controlesAPI.obtenerTodos(params);
      setControles(response.data.controles);
    } catch (error) {
      console.error('Error al cargar controles:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleFiltrar = () => {
    const params = {};
    if (filtros.fecha) params.fecha = filtros.fecha;
    if (filtros.proveedor) params.proveedor = filtros.proveedor;
    if (filtros.resultado) params.resultado = filtros.resultado;
    cargarControles(params);
  };

  const handleLimpiar = () => {
    setFiltros({ fecha: '', proveedor: '', resultado: '' });
    cargarControles();
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getIconoResultado = (resultado) => {
    switch (resultado) {
      case 'aprobado':
        return <CheckCircle size={20} className="icono-aprobado" />;
      case 'rechazado':
        return <XCircle size={20} className="icono-rechazado" />;
      case 'pendiente':
        return <Clock size={20} className="icono-pendiente" />;
      default:
        return null;
    }
  };

  return (
    <div className="historial-page">
      <h1 className="page-title">Historial de Controles</h1>
      <div className="divider"></div>

      <div className="historial-layout">
        {/* Panel de Filtros */}
        <div className="filtros-panel">
          <h2 className="filtros-titulo">Filtros</h2>

          <div className="filtros-form">
            <div className="filtro-grupo">
              <label className="form-label">Filtro por Fecha</label>
              <input
                type="date"
                className="form-input"
                value={filtros.fecha}
                onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
              />
            </div>

            <div className="filtro-grupo">
              <label className="form-label">Filtro por Proveedor</label>
              <div className="chips-container">
                {proveedores.map((p) => (
                  <button
                    key={p.id_proveedor}
                    type="button"
                    className={`chip ${filtros.proveedor === p.nombre ? 'chip-active' : ''}`}
                    onClick={() =>
                      setFiltros({
                        ...filtros,
                        proveedor: filtros.proveedor === p.nombre ? '' : p.nombre,
                      })
                    }
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="filtro-grupo">
              <label className="form-label">Filtro por Resultado</label>
              <div className="chips-container">
                {['aprobado', 'rechazado', 'pendiente'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`chip ${filtros.resultado === r ? 'chip-active' : ''}`}
                    onClick={() =>
                      setFiltros({
                        ...filtros,
                        resultado: filtros.resultado === r ? '' : r,
                      })
                    }
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filtros-botones">
              <button className="btn-primary-historial" onClick={handleFiltrar}>
                Filtrar
              </button>
              <button className="btn-limpiar" onClick={handleLimpiar}>
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className="resultados-panel">
          <h2 className="resultados-titulo">Resultados</h2>

          {cargando ? (
            <p className="cargando">Cargando...</p>
          ) : controles.length === 0 ? (
            <p className="sin-resultados">No se encontraron controles</p>
          ) : (
            <div className="resultados-lista">
              {controles.map((control) => (
                <div key={control.id_control} className="resultado-card">
                  <div className="resultado-fila">
                    <div className="resultado-icono">
                      <Calendar size={20} />
                    </div>
                    <span className="resultado-label">Fecha</span>
                    <span className="resultado-valor">
                      {formatearFecha(control.fecha_control)}
                    </span>
                  </div>

                  <div className="resultado-fila">
                    <div className="resultado-icono">
                      <Building2 size={20} />
                    </div>
                    <span className="resultado-label">Proveedor</span>
                    <span className="resultado-valor">{control.nombre_proveedor}</span>
                  </div>

                  <div className="resultado-fila">
                    <div className="resultado-icono">
                      <Sprout size={20} />
                    </div>
                    <span className="resultado-label">Variedad</span>
                    <span className="resultado-valor">{control.nombre_variedad}</span>
                  </div>

                  <div className="resultado-fila">
                    <div className="resultado-icono">
                      {getIconoResultado(control.resultado)}
                    </div>
                    <span className="resultado-label">Resultado</span>
                    <span className={`resultado-valor resultado-${control.resultado}`}>
                      {control.resultado.charAt(0).toUpperCase() + control.resultado.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Historial;
