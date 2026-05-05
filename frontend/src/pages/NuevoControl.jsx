import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { camionesAPI, proveedoresAPI, variedadesAPI, controlesAPI } from '../api/services';
import './NuevoControl.css';

const NuevoControl = () => {
  const navigate = useNavigate();

  const [camiones, setCamiones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [variedades, setVariedades] = useState([]);

  const [formData, setFormData] = useState({
    id_camion: null,
    id_variedad: null,
    kilos_total: '',
    kilos_sin_defectos: '',
    kilos_verde: '',
    kilos_podridos: '',
    kilos_limitado: '',
    brix: '',
    observaciones: '',
  });

  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [camionesRes, proveedoresRes, variedadesRes] = await Promise.all([
        camionesAPI.obtenerTodos(),
        proveedoresAPI.obtenerTodos(),
        variedadesAPI.obtenerTodos(),
      ]);
      setCamiones(camionesRes.data);
      setProveedores(proveedoresRes.data);
      setVariedades(variedadesRes.data);
    } catch (err) {
      setError('Error al cargar los datos del formulario');
    }
  };

  // Filtrar camiones por proveedor seleccionado
  const camionesFiltrados = proveedorSeleccionado
    ? camiones.filter((c) => c.id_proveedor === proveedorSeleccionado)
    : camiones;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!formData.id_camion || !formData.id_variedad) {
      setError('Debes seleccionar un camión y una variedad');
      return;
    }

    if (!formData.kilos_total || !formData.brix) {
      setError('Los kilos totales y el brix son obligatorios');
      return;
    }

    setCargando(true);

    try {
      const datos = {
        id_camion: parseInt(formData.id_camion),
        id_variedad: parseInt(formData.id_variedad),
        kilos_total: parseFloat(formData.kilos_total),
        kilos_sin_defectos: parseFloat(formData.kilos_sin_defectos) || 0,
        kilos_verde: parseFloat(formData.kilos_verde) || 0,
        kilos_podridos: parseFloat(formData.kilos_podridos) || 0,
        kilos_limitado: parseFloat(formData.kilos_limitado) || 0,
        brix: parseFloat(formData.brix),
        observaciones: formData.observaciones || null,
      };

      const response = await controlesAPI.crear(datos);
      setExito(`Control creado exitosamente. Resultado: ${response.data.control.resultado.toUpperCase()}`);

      setTimeout(() => {
        navigate('/historial');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el control');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="nuevo-control-page">
      <div className="nuevo-control-layout">
        <div className="nuevo-control-titulo">
          <h1>Nuevo Control<br />de Calidad</h1>
        </div>

        <form className="nuevo-control-form" onSubmit={handleSubmit}>
          {/* Selector de Proveedor */}
          <div className="form-group">
            <label className="form-label">Selector Proveedor</label>
            <div className="chips-container">
              {proveedores.map((p) => (
                <button
                  key={p.id_proveedor}
                  type="button"
                  className={`chip ${proveedorSeleccionado === p.id_proveedor ? 'chip-active' : ''}`}
                  onClick={() => {
                    setProveedorSeleccionado(p.id_proveedor);
                    setFormData({ ...formData, id_camion: null });
                  }}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Camión */}
          <div className="form-group">
            <label className="form-label">Selector Camión</label>
            <div className="chips-container">
              {camionesFiltrados.length === 0 ? (
                <p className="form-info">
                  {proveedorSeleccionado
                    ? 'No hay camiones para este proveedor'
                    : 'Selecciona primero un proveedor'}
                </p>
              ) : (
                camionesFiltrados.map((c) => (
                  <button
                    key={c.id_camion}
                    type="button"
                    className={`chip ${formData.id_camion === c.id_camion ? 'chip-active' : ''}`}
                    onClick={() => setFormData({ ...formData, id_camion: c.id_camion })}
                  >
                    {c.matricula}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Selector de Variedad */}
          <div className="form-group">
            <label className="form-label">Selector Variedad</label>
            <div className="chips-container">
              {variedades.map((v) => (
                <button
                  key={v.id_variedad}
                  type="button"
                  className={`chip ${formData.id_variedad === v.id_variedad ? 'chip-active' : ''}`}
                  onClick={() => setFormData({ ...formData, id_variedad: v.id_variedad })}
                >
                  {v.nombre_variedad}
                </button>
              ))}
            </div>
          </div>

          {/* Campos numéricos */}
          <div className="form-group">
            <label className="form-label">Kilos Totales</label>
            <input
              type="number"
              name="kilos_total"
              className="form-input"
              placeholder="Ingrese kilos totales"
              value={formData.kilos_total}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kilos Sin Defectos</label>
            <input
              type="number"
              name="kilos_sin_defectos"
              className="form-input"
              placeholder="Ingrese kilos sin defectos"
              value={formData.kilos_sin_defectos}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kilos Verdes</label>
            <input
              type="number"
              name="kilos_verde"
              className="form-input"
              placeholder="Ingrese kilos verdes"
              value={formData.kilos_verde}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kilos Podridos</label>
            <input
              type="number"
              name="kilos_podridos"
              className="form-input"
              placeholder="Ingrese kilos podridos"
              value={formData.kilos_podridos}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kilos Limitados</label>
            <input
              type="number"
              name="kilos_limitado"
              className="form-input"
              placeholder="Ingrese kilos limitados"
              value={formData.kilos_limitado}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Brix</label>
            <input
              type="number"
              name="brix"
              className="form-input"
              placeholder="Ingrese valor de Brix"
              value={formData.brix}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="15"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea
              name="observaciones"
              className="form-textarea"
              placeholder="Escriba sus observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="4"
            />
            <span className="form-hint">Campo amplio</span>
          </div>

          {error && <div className="form-error">{error}</div>}
          {exito && <div className="form-success">{exito}</div>}

          <button
            type="submit"
            className="btn-guardar"
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : 'Guardar Control'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NuevoControl;
