import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { proveedoresAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import './Gestion.css';
import './NuevoControl.css';

const Proveedores = () => {
  const { esAdmin } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', localidad: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setCargando(true);
    try {
      const response = await proveedoresAPI.obtenerTodos();
      setProveedores(response.data);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setEditando(null);
    setFormData({ nombre: '', localidad: '' });
    setError('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (proveedor) => {
    setEditando(proveedor.id_proveedor);
    setFormData({
      nombre: proveedor.nombre,
      localidad: proveedor.localidad || '',
    });
    setError('');
    setMostrarModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editando) {
        await proveedoresAPI.actualizar(editando, formData);
      } else {
        await proveedoresAPI.crear(formData);
      }
      setMostrarModal(false);
      cargarProveedores();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de desactivar este proveedor?')) return;

    try {
      await proveedoresAPI.eliminar(id);
      cargarProveedores();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div className="gestion-page">
      <div className="gestion-header">
        <h1>Proveedores</h1>
        {esAdmin() && (
          <button className="btn-nuevo" onClick={abrirModalNuevo}>
            <Plus size={20} />
            Nuevo Proveedor
          </button>
        )}
      </div>

      <div className="divider"></div>

      <div className="gestion-tabla-container">
        {cargando ? (
          <div className="gestion-vacio">Cargando...</div>
        ) : proveedores.length === 0 ? (
          <div className="gestion-vacio">No hay proveedores registrados</div>
        ) : (
          <table className="gestion-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Localidad</th>
                <th>Estado</th>
                {esAdmin() && <th style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id_proveedor}>
                  <td>{p.nombre}</td>
                  <td>{p.localidad || '-'}</td>
                  <td>{p.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                  {esAdmin() && (
                    <td>
                      <div className="gestion-acciones">
                        <button
                          className="btn-icon"
                          onClick={() => abrirModalEditar(p)}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-eliminar"
                          onClick={() => handleEliminar(p.id_proveedor)}
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
              {editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>

            <form className="modal-form" onSubmit={handleGuardar}>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Localidad</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.localidad}
                  onChange={(e) =>
                    setFormData({ ...formData, localidad: e.target.value })
                  }
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

export default Proveedores;
