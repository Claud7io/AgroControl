import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { camionesAPI, proveedoresAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import './Gestion.css';
import './NuevoControl.css';

const Camiones = () => {
  const { esAdmin } = useAuth();
  const [camiones, setCamiones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ matricula: '', id_proveedor: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [camionesRes, proveedoresRes] = await Promise.all([
        camionesAPI.obtenerTodos(),
        proveedoresAPI.obtenerTodos(),
      ]);
      setCamiones(camionesRes.data);
      setProveedores(proveedoresRes.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setEditando(null);
    setFormData({ matricula: '', id_proveedor: '' });
    setError('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (camion) => {
    setEditando(camion.id_camion);
    setFormData({
      matricula: camion.matricula,
      id_proveedor: camion.id_proveedor,
    });
    setError('');
    setMostrarModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.id_proveedor) {
      setError('Debes seleccionar un proveedor');
      return;
    }

    try {
      const datos = {
        matricula: formData.matricula,
        id_proveedor: parseInt(formData.id_proveedor),
      };

      if (editando) {
        await camionesAPI.actualizar(editando, datos);
      } else {
        await camionesAPI.crear(datos);
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de desactivar este camión?')) return;

    try {
      await camionesAPI.eliminar(id);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div className="gestion-page">
      <div className="gestion-header">
        <h1>Camiones</h1>
        {esAdmin() && (
          <button className="btn-nuevo" onClick={abrirModalNuevo}>
            <Plus size={20} />
            Nuevo Camión
          </button>
        )}
      </div>

      <div className="divider"></div>

      <div className="gestion-tabla-container">
        {cargando ? (
          <div className="gestion-vacio">Cargando...</div>
        ) : camiones.length === 0 ? (
          <div className="gestion-vacio">No hay camiones registrados</div>
        ) : (
          <table className="gestion-tabla">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Proveedor</th>
                <th>Localidad</th>
                <th>Estado</th>
                {esAdmin() && <th style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {camiones.map((c) => (
                <tr key={c.id_camion}>
                  <td><strong>{c.matricula}</strong></td>
                  <td>{c.nombre_proveedor}</td>
                  <td>{c.localidad_proveedor || '-'}</td>
                  <td>{c.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                  {esAdmin() && (
                    <td>
                      <div className="gestion-acciones">
                        <button
                          className="btn-icon"
                          onClick={() => abrirModalEditar(c)}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-eliminar"
                          onClick={() => handleEliminar(c.id_camion)}
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
              {editando ? 'Editar Camión' : 'Nuevo Camión'}
            </h2>

            <form className="modal-form" onSubmit={handleGuardar}>
              <div className="form-group">
                <label className="form-label">Matrícula *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.matricula}
                  onChange={(e) =>
                    setFormData({ ...formData, matricula: e.target.value })
                  }
                  placeholder="Ej: 1234 BCD"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Proveedor *</label>
                <select
                  className="form-select"
                  value={formData.id_proveedor}
                  onChange={(e) =>
                    setFormData({ ...formData, id_proveedor: e.target.value })
                  }
                  required
                >
                  <option value="">Selecciona un proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
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

export default Camiones;
