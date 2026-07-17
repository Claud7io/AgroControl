-- ============================================================
-- AgroControl - Datos de prueba (seed)
-- Requiere ejecutar previamente: 01_schema.sql
-- ============================================================

-- ============================================================
-- USE agrocontrol;
-- ============================================================

-- Limpiar tablas por si se ejecuta varias veces
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE control_calidad;
TRUNCATE TABLE proveedor_variedad;
TRUNCATE TABLE camion;
TRUNCATE TABLE variedad;
TRUNCATE TABLE proveedor;
TRUNCATE TABLE usuario;
SET FOREIGN_KEY_CHECKS = 1;


-- ------------------------------------------------------------
-- USUARIOS
-- ------------------------------------------------------------
-- IMPORTANTE: los password_hash son PLACEHOLDERS.
-- En la Fase 2 (backend) se sustituirán por hashes bcrypt reales
-- mediante un script Node.js. Las contraseñas de prueba previstas:
--
--   admin@agrocontrol.local     -> Admin1234!
--   operario@agrocontrol.local  -> Operario1234!
--   maria.gomez@agrocontrol.local -> Operario1234!
-- ------------------------------------------------------------
INSERT INTO usuario (nombre, email, password_hash, rol) VALUES
  ('Administrador del Sistema', 'admin@agrocontrol.local',
   '$2b$10$PLACEHOLDER_REPLACE_IN_PHASE_2_BACKEND_SEED_SCRIPT',
   'administrador'),
  ('Juan Pérez',                'operario@agrocontrol.local',
   '$2b$10$PLACEHOLDER_REPLACE_IN_PHASE_2_BACKEND_SEED_SCRIPT',
   'operario'),
  ('María Gómez',               'maria.gomez@agrocontrol.local',
   '$2b$10$PLACEHOLDER_REPLACE_IN_PHASE_2_BACKEND_SEED_SCRIPT',
   'operario');


-- ------------------------------------------------------------
-- PROVEEDORES
-- ------------------------------------------------------------
INSERT INTO proveedor (nombre, localidad) VALUES
  ('Cooperativa Agrícola Vegas Altas', 'Don Benito'),
  ('Tomates del Guadiana S.L.',        'Mérida'),
  ('Agro Extremadura SAT',             'Villanueva de la Serena'),
  ('Campos del Sur Cooperativa',       'Badajoz');


-- ------------------------------------------------------------
-- VARIEDADES (habituales en industria del tomate)
-- ------------------------------------------------------------
INSERT INTO variedad (nombre_variedad) VALUES
  ('Heinz 1015'),
  ('Rio Grande'),
  ('H-9661'),
  ('CXD-179'),
  ('Kalvert');


-- ------------------------------------------------------------
-- PROVEEDOR_VARIEDAD (relación N:M)
-- ------------------------------------------------------------
INSERT INTO proveedor_variedad (id_proveedor, id_variedad) VALUES
  (1, 1), (1, 2), (1, 5),
  (2, 1), (2, 3),
  (3, 2), (3, 3), (3, 4),
  (4, 4), (4, 5);


-- ------------------------------------------------------------
-- CAMIONES
-- ------------------------------------------------------------
INSERT INTO camion (matricula, id_proveedor) VALUES
  ('1234 BCD', 1),
  ('5678 FGH', 1),
  ('9012 JKL', 2),
  ('3456 MNP', 3),
  ('7890 QRS', 3),
  ('2345 TVW', 4);


-- ------------------------------------------------------------
-- CONTROLES DE CALIDAD
--   No se pasa 'resultado': el trigger lo evalúa automáticamente
--   según los criterios definidos en 01_schema.sql.
-- ------------------------------------------------------------
INSERT INTO control_calidad
  (fecha_control, id_usuario, id_camion, id_variedad,
   kilos_total, kilos_sin_defectos, kilos_verde, kilos_podridos, kilos_limitado,
   brix, observaciones)
VALUES
  -- Casos que cumplen criterios (se evaluarán como 'aprobado')
  ('2026-04-15 09:15:00', 2, 1, 1,
   25000.00, 23500.00,  800.00,  200.00,  500.00, 5.20,
   'Carga en buen estado general.'),
  ('2026-04-15 11:40:00', 2, 3, 1,
   24800.00, 23200.00,  900.00,  300.00,  400.00, 4.90,
   'Dentro de parámetros.'),
  ('2026-04-16 08:05:00', 3, 4, 2,
   26100.00, 24800.00,  700.00,  200.00,  400.00, 5.10,
   NULL),

  -- Casos con exceso de defectos (se evaluarán como 'rechazado')
  ('2026-04-16 12:20:00', 2, 2, 5,
   24500.00, 19000.00, 2100.00, 1500.00, 1900.00, 4.10,
   'Exceso de podridos tras lluvias.'),
  ('2026-04-17 10:05:00', 3, 5, 3,
   25300.00, 20800.00, 1800.00, 1200.00, 1500.00, 3.80,
   'Brix por debajo del mínimo.'),

  -- Caso que entrará automáticamente como aprobado,
  -- lo forzaremos a 'pendiente' después para probar ese estado
  ('2026-04-17 14:50:00', 2, 6, 4,
   24000.00, 22800.00,  600.00,  200.00,  400.00, 5.00,
   'Entrada de tarde - a la espera de validación del responsable.');


-- Forzamos el último control a 'pendiente' para poder
-- probar el filtro 'Pendiente' del wireframe de Historial.
-- El trigger BEFORE INSERT no se dispara en UPDATE, así que respeta el valor.
UPDATE control_calidad
SET resultado = 'pendiente'
WHERE id_control = (
  SELECT id_control FROM (
    SELECT MAX(id_control) AS id_control FROM control_calidad
  ) AS t
);


-- ------------------------------------------------------------
-- Consultas de verificación (opcional)
-- Descomenta para ver el resultado tras la carga
-- ------------------------------------------------------------
-- SELECT id_control, fecha_control, resultado, porcentaje_defectos, brix
-- FROM control_calidad
-- ORDER BY fecha_control;
--
-- SELECT p.nombre AS proveedor, GROUP_CONCAT(v.nombre_variedad) AS variedades
-- FROM proveedor p
-- JOIN proveedor_variedad pv ON pv.id_proveedor = p.id_proveedor
-- JOIN variedad v ON v.id_variedad = pv.id_variedad
-- GROUP BY p.id_proveedor;
