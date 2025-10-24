const express = require('express');
const router = express.Router();

module.exports = (dbClient, jwtMiddleware) => {
  router.post('/new-round', jwtMiddleware, async (req, res) => {
    try {
      await dbClient.query('UPDATE rounds SET active = false WHERE active = true');
      await dbClient.query('INSERT INTO rounds (active) VALUES (true)');
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
  router.post('/close', jwtMiddleware, async (req, res) => {
    try {
      const result = await dbClient.query('UPDATE rounds SET active = false WHERE active = true');
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/store-results', jwtMiddleware, async (req, res) => {
    try {
      const { numbers } = req.body;
      if (!Array.isArray(numbers)) return res.status(400).json({ error: 'Numbers array required' });

      const roundRes = await dbClient.query('SELECT id, active, drawn_numbers FROM rounds ORDER BY created_at DESC LIMIT 1');
      if (roundRes.rowCount === 0) {
        return res.status(400).json({ error: 'No round exists' });
      }
      const round = roundRes.rows[0];

      if (round.active) {
        return res.status(400).json({ error: 'Cannot store results while payments are active' });
      }
      if (round.drawn_numbers && round.drawn_numbers.length > 0) {
        return res.status(400).json({ error: 'Numbers already drawn for this round' });
      }

      await dbClient.query('UPDATE rounds SET drawn_numbers = $1 WHERE id = $2', [numbers, round.id]);
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
