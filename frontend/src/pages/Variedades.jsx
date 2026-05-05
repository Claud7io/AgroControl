import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { variedadesAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import './Gestion.css';
import './NuevoControl.css';

const Variedades = () => {
  const { esAdmin } = useAuth();
  const [variedades, setVariedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre_variedad: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    cargarVariedades();
  }, []);

  const cargarVariedades = async () => {
    setCargando(true);
    try {
      const response = await variedadesAPI.obtenerTodos();
      setVariedades(response.data);
    } catch (err) {
      console.error('Error al cargar variedades:', err);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setEditando(null);
    setFormData({ nombre_variedad: '' });
    setError('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (variedad) => {
    setEditando(variedad.id_variedad);
    setFormData({ nombre_variedad: variedad.nombre_variedad });
    setError('');
    setMostrarModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editando) {
        await variedadesAPI.actualizar(editando, formData);
      } else {
        await variedadesAPI.crear(formData);
      }
      setMostrarModal(false);
      cargarVariedades();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de desactivar esta variedad?')) return;

    try {
      await variedadesAPI.eliminar(id);
      cargarVariedades();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div className="gestion-page">
      <div className="gestion-header">
        <h1>Variedades</h1>
        {esAdmin() && (
          <button className="btn-nuevo" onClick={abrirModalNuevo}>
            <Plus size={20} />
            Nueva Variedad
          </button>
        )}
      </div>

      <div className="divider"></div>

      <div className="gestion-tabla-container">
        {cargando ? (
          <div className="gestion-vacio">Cargando...</div>
        ) : variedades.length === 0 ? (
          <div className="gestion-vacio">No hay variedades registradas</div>
        ) : (
          <table className="gestion-tabla">
            <thead>
              <tr>
                <th>Nombre de la Variedad</th>
                <th>Estado</th>
                <th>Fecha de creación</th>
                {esAdmin() && <th style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {variedades.map((v) => (
                <tr key={v.id_variedad}>
                  <td><strong>{v.nombre_variedad}</strong></td>
                  <td>{v.activo ? '✅ Activa' : '❌ Inactiva'}</td>
                  <td>
                    {new Date(v.fecha_creacion).toLocaleDateString('es-ES')}
                  </td>
                  {esAdmin() && (
                    <td>
                      <div className="gestion-acciones">
                        <button
                          className="btn-icon"
                          onClick={() => abrirModalEditar(v)}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-eliminar"
                          onClick={() => handleEliminar(v.id_variedad)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-titulo">
              {editando ? 'Editar Variedad' : 'Nueva Variedad'}
            </h2>

            <form className="modal-form" onSubmit={handleGuardar}>
              <div className="form-group">
                <label className="form-label">Nombre de la Variedad *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombre_variedad}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_variedad: e.target.value })
                  }
                  placeholder="Ej: Heinz 1015"
                  required
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-acciones">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar-modal">
                  {editando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Variedades;
