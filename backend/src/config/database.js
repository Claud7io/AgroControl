const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexiones a MariaDB
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'agrocontrol',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Verificar conexión al iniciar
const verificarConexion = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a MariaDB');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar con MariaDB:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, verificarConexion };
