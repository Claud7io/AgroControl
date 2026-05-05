import api from './axios';

// === AUTH ===
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  obtenerPerfil: () => api.get('/auth/perfil'),
  registrar: (datos) => api.post('/auth/register', datos),
};

// === CONTROLES ===
export const controlesAPI = {
  obtenerTodos: (params = {}) => api.get('/controles', { params }),
  obtenerPorId: (id) => api.get(`/controles/${id}`),
  crear: (datos) => api.post('/controles', datos),
  actualizar: (id, datos) => api.put(`/controles/${id}`, datos),
  eliminar: (id) => api.delete(`/controles/${id}`),
  estadisticasHoy: () => api.get('/controles/estadisticas/hoy'),
};

// === PROVEEDORES ===
export const proveedoresAPI = {
  obtenerTodos: (params = {}) => api.get('/proveedores', { params }),
  obtenerPorId: (id) => api.get(`/proveedores/${id}`),
  crear: (datos) => api.post('/proveedores', datos),
  actualizar: (id, datos) => api.put(`/proveedores/${id}`, datos),
  eliminar: (id) => api.delete(`/proveedores/${id}`),
};

// === CAMIONES ===
export const camionesAPI = {
  obtenerTodos: (params = {}) => api.get('/camiones', { params }),
  obtenerPorId: (id) => api.get(`/camiones/${id}`),
  crear: (datos) => api.post('/camiones', datos),
  actualizar: (id, datos) => api.put(`/camiones/${id}`, datos),
  eliminar: (id) => api.delete(`/camiones/${id}`),
};

// === VARIEDADES ===
export const variedadesAPI = {
  obtenerTodos: (params = {}) => api.get('/variedades', { params }),
  obtenerPorId: (id) => api.get(`/variedades/${id}`),
  crear: (datos) => api.post('/variedades', datos),
  actualizar: (id, datos) => api.put(`/variedades/${id}`, datos),
  eliminar: (id) => api.delete(`/variedades/${id}`),
};

// === USUARIOS ===
export const usuariosAPI = {
  obtenerTodos: (params = {}) => api.get('/usuarios', { params }),
  obtenerPorId: (id) => api.get(`/usuarios/${id}`),
  actualizar: (id, datos) => api.put(`/usuarios/${id}`, datos),
  eliminar: (id) => api.delete(`/usuarios/${id}`),
};
