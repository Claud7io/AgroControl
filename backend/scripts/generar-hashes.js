/**
 * Script para generar hashes bcrypt y actualizar la tabla usuario
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

const usuarios = [
  {
    email: 'admin@agrocontrol.local',
    password: 'Admin1234!'
  },
  {
    email: 'operario@agrocontrol.local',
    password: 'Operario1234!'
  },
  {
    email: 'maria.gomez@agrocontrol.local',
    password: 'Operario1234!'
  }
];

const generarHashesYActualizar = async () => {
  let connection;
  
  try {
    console.log('🔐 Generando hashes bcrypt...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'agrocontrol',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conexión a la base de datos establecida\n');

    const saltRounds = 10;

    for (const usuario of usuarios) {
      const hash = await bcrypt.hash(usuario.password, saltRounds);
      
      console.log(`📧 Email: ${usuario.email}`);
      console.log(`🔒 Contraseña: ${usuario.password}`);
      console.log(`#️⃣  Hash: ${hash}`);

      const [resultado] = await connection.query(
        'UPDATE usuario SET password_hash = ? WHERE email = ?',
        [hash, usuario.email]
      );

      if (resultado.affectedRows > 0) {
        console.log(`✅ Hash actualizado en la base de datos\n`);
      } else {
        console.log(`⚠️  Usuario no encontrado en la base de datos\n`);
      }
    }

    console.log('===========================================');
    console.log('✅ Proceso completado exitosamente');
    console.log('===========================================');
    console.log('\n💡 Ahora puedes iniciar el servidor con: npm start\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

generarHashesYActualizar();