import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { usuariosAPI, authAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import './Gestion.css';
import './NuevoControl.css';

const Usuarios = () => {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'operario',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const response = await usuariosAPI.obtenerTodos({ incluir_inactivos: true });
      setUsuarios(response.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setEditando(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'operario' });
    setError('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (usr) => {
    setEditando(usr.id_usuario);
    setFormData({
      nombre: usr.nombre,
      email: usr.email,
      password: '',
      rol: usr.rol,
    });
    setError('');
    setMostrarModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editando) {
        // Solo enviar contraseña si se ha rellenado
        const datos = { ...formData };
        if (!datos.password) delete datos.password;
        await usuariosAPI.actualizar(editando, datos);
      } else {
        if (!formData.password) {
          setError('La contraseña es obligatoria para nuevos usuarios');
          return;
        }
        await authAPI.registrar(formData);
      }
      setMostrarModal(false);
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de desactivar este usuario?')) return;

    try {
      await usuariosAPI.eliminar(id);
      cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div className="gestion-page">
      <div className="gestion-header">
        <h1>Usuarios</h1>
        <button className="btn-nuevo" onClick={abrirModalNuevo}>
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="divider"></div>

      <div className="gestion-tabla-container">
        {cargando ? (
          <div className="gestion-vacio">Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="gestion-vacio">No hay usuarios registrados</div>
        ) : (
          <table className="gestion-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id_usuario}>
                  <td><strong>{u.nombre}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    {u.rol === 'administrador' ? '👑 Administrador' : '👤 Operario'}
                  </td>
                  <td>{u.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                  <td>
                    <div className="gestion-acciones">
                      <button
                        className="btn-icon"
                        onClick={() => abrirModalEditar(u)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      {u.id_usuario !== usuarioActual.id_usuario && (
                        <button
                          className="btn-icon btn-icon-eliminar"
                          onClick={() => handleEliminar(u.id_usuario)}
                          title="Desactivar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
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
              {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contraseña {editando ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editando}
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol *</label>
                <select
                  className="form-select"
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                  required
                >
                  <option value="operario">Operario</option>
                  <option value="administrador">Administrador</option>
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

export default Usuarios;
