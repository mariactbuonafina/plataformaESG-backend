const { Pool } = require('pg');

let isDbConnected = false;
let pool;

// tenta inicializar conexão real com Postgres
try {
  pool = new Pool({
    user: process.env.DB_USER || 'esg_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'esg_db',
    password: process.env.DB_PASS || 'esg_pass',
    port: process.env.DB_PORT || 5432,
  });

  pool.connect()
    .then(() => {
      console.log('✅ Conectado ao PostgreSQL');
      isDbConnected = true;
    })
    .catch(err => {
      console.warn('⚠️ Não foi possível conectar ao PostgreSQL. Usando modo FAKE.');
      isDbConnected = false;
    });

} catch (err) {
  console.warn('⚠️ Erro ao inicializar conexão. Usando modo FAKE.');
  isDbConnected = false;
}

module.exports = {
  query: async (text, params) => {
    if (!isDbConnected) {
      // ---------- DADOS FAKE ----------
      if (text.includes('SELECT * FROM users')) {
        return {
          rows: [
            { id: 1, name: 'Usuário Fake', email: 'fake@empresa.com' },
            { id: 2, name: 'Maria', email: 'maria@teste.com' },
          ]
        };
      }
      return { rows: [] };
    }

    // ---------- MODO REAL ----------
    return pool.query(text, params);
  }
};
