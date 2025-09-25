const express = require('express');
const app = express();
const port = 3333;
const db = require('./db');

app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
