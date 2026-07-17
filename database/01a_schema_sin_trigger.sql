-- ============================================================
-- AgroControl - Esquema de Base de Datos (SIN TRIGGER)
-- SGBD: MariaDB 10.6+
-- Codificación: utf8mb4_unicode_ci
-- Autor: Claudio Terrados Sánchez
-- Proyecto Intermodular DAW 25/26 - IES Albarregas
-- ============================================================

-- ============================================================

-- DROP DATABASE IF EXISTS agrocontrol;
-- CREATE DATABASE agrocontrol
--   CHARACTER SET utf8mb4
--   COLLATE utf8mb4_unicode_ci;

-- USE agrocontrol;

-- ============================================================


-- ------------------------------------------------------------
-- Tabla: usuario
-- ------------------------------------------------------------
CREATE TABLE usuario (
  id_usuario      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100)       NOT NULL,
  email           VARCHAR(150)       NOT NULL,
  password_hash   VARCHAR(255)       NOT NULL,
  rol             ENUM('operario','administrador') NOT NULL DEFAULT 'operario',
  activo          BOOLEAN            NOT NULL DEFAULT TRUE,
  fecha_creacion  TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuario_email UNIQUE (email)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- Tabla: proveedor
-- ------------------------------------------------------------
CREATE TABLE proveedor (
  id_proveedor    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(150)       NOT NULL,
  localidad       VARCHAR(100),
  activo          BOOLEAN            NOT NULL DEFAULT TRUE,
  fecha_creacion  TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_proveedor_nombre UNIQUE (nombre)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- Tabla: variedad
-- ------------------------------------------------------------
CREATE TABLE variedad (
  id_variedad     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_variedad VARCHAR(100)       NOT NULL,
  activo          BOOLEAN            NOT NULL DEFAULT TRUE,
  fecha_creacion  TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_variedad_nombre UNIQUE (nombre_variedad)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- Tabla: proveedor_variedad (N:M)
-- ------------------------------------------------------------
CREATE TABLE proveedor_variedad (
  id_proveedor    INT UNSIGNED NOT NULL,
  id_variedad     INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_proveedor, id_variedad),
  CONSTRAINT fk_pv_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pv_variedad
    FOREIGN KEY (id_variedad) REFERENCES variedad(id_variedad)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- Tabla: camion
-- ------------------------------------------------------------
CREATE TABLE camion (
  id_camion       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  matricula       VARCHAR(15)        NOT NULL,
  id_proveedor    INT UNSIGNED       NOT NULL,
  activo          BOOLEAN            NOT NULL DEFAULT TRUE,
  fecha_creacion  TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_camion_matricula UNIQUE (matricula),
  CONSTRAINT fk_camion_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- Tabla: control_calidad (núcleo del sistema)
-- ------------------------------------------------------------
CREATE TABLE control_calidad (
  id_control          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha_control       TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario          INT UNSIGNED       NOT NULL,
  id_camion           INT UNSIGNED       NOT NULL,
  id_variedad         INT UNSIGNED       NOT NULL,
  kilos_total         DECIMAL(10,2)      NOT NULL,
  kilos_sin_defectos  DECIMAL(10,2)      NOT NULL DEFAULT 0,
  kilos_verde         DECIMAL(10,2)      NOT NULL DEFAULT 0,
  kilos_podridos      DECIMAL(10,2)      NOT NULL DEFAULT 0,
  kilos_limitado      DECIMAL(10,2)      NOT NULL DEFAULT 0,
  porcentaje_defectos DECIMAL(5,2)
    GENERATED ALWAYS AS (
      ROUND(((kilos_verde + kilos_podridos + kilos_limitado) / kilos_total) * 100, 2)
    ) VIRTUAL,
  brix                DECIMAL(4,2)       NOT NULL,
  resultado           ENUM('aprobado','rechazado','pendiente') NOT NULL DEFAULT 'pendiente',
  observaciones       TEXT,
  CONSTRAINT fk_cc_usuario
    FOREIGN KEY (id_usuario)  REFERENCES usuario(id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cc_camion
    FOREIGN KEY (id_camion)   REFERENCES camion(id_camion)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cc_variedad
    FOREIGN KEY (id_variedad) REFERENCES variedad(id_variedad)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_cc_kilos_total_positivo CHECK (kilos_total > 0),
  CONSTRAINT chk_cc_kilos_no_negativos CHECK (
       kilos_sin_defectos >= 0
   AND kilos_verde        >= 0
   AND kilos_podridos     >= 0
   AND kilos_limitado     >= 0
  ),
  CONSTRAINT chk_cc_suma_kilos CHECK (
    (kilos_sin_defectos + kilos_verde + kilos_podridos + kilos_limitado) <= kilos_total
  ),
  CONSTRAINT chk_cc_brix CHECK (brix >= 0 AND brix <= 15)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- Índices estratégicos
-- ------------------------------------------------------------
CREATE INDEX idx_cc_fecha     ON control_calidad (fecha_control);
CREATE INDEX idx_cc_resultado ON control_calidad (resultado);
CREATE INDEX idx_cc_camion    ON control_calidad (id_camion);
CREATE INDEX idx_cc_variedad  ON control_calidad (id_variedad);
CREATE INDEX idx_cc_usuario   ON control_calidad (id_usuario);
CREATE INDEX idx_camion_prov  ON camion (id_proveedor);
