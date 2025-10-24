require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const { createJwtMiddleware } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN; 
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const APP_TICKET_URL = process.env.APP_TICKET_URL;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const ticketsRouterFactory = require('./routes/tickets');
const adminRouterFactory = require('./routes/admin');

const ticketsRouter = ticketsRouterFactory(pool, APP_TICKET_URL);

const jwtMiddleware = createJwtMiddleware(AUTH0_AUDIENCE, AUTH0_DOMAIN);

const adminRouter = adminRouterFactory(pool, jwtMiddleware);

app.use('/api/tickets', ticketsRouter);
app.use('/api', adminRouter);

app.get('/', (req, res) => {
  res.send({ status: 'loto backend running' });
});

app.get('/api/status', async (req, res) => {
  try {
    const roundRes = await pool.query('SELECT id, uuid, active, drawn_numbers FROM rounds ORDER BY created_at DESC LIMIT 1');
    if (roundRes.rowCount === 0) return res.json({ hasRound: false });
    const round = roundRes.rows[0];
    const ticketsRes = await pool.query('SELECT COUNT(*) FROM tickets WHERE round_id = $1', [round.id]);
    return res.json({
      hasRound: true,
      active: round.active,
      drawn_numbers: round.drawn_numbers,
      tickets_count: Number(ticketsRes.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError' || err.name === 'Unauthorized') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
