const { isDbConnected, pool } = require('./db');

environment: REACT_APP_API_URL: http: //backend:3333module.exports = {
query: async (text, params) => {
  if (!isDbConnected) {
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

  return pool.query(text, params);
};
