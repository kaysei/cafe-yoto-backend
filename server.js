require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD
    });

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/state/:key', async (req, res) => {
  try {
    const r = await pool.query('SELECT value FROM app_state WHERE key=$1', [req.params.key]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json({ key: req.params.key, value: r.rows[0].value });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/state/:key', async (req, res) => {
  try {
    const value = req.body.value;
    if (typeof value !== 'string') return res.status(400).json({ error: 'value must be a string' });
    await pool.query(
      `INSERT INTO app_state(key, value, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()`,
      [req.params.key, value]
    );
    res.json({ key: req.params.key, value });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/state/:key', async (req, res) => {
  try {
    await pool.query('DELETE FROM app_state WHERE key=$1', [req.params.key]);
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cafe Yoto backend running on http://localhost:${PORT}`);
  console.log('On your phone or another PC on the same wifi, use this computer\'s LAN IP instead of localhost.');
});
