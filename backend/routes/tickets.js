const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

module.exports = (dbClient, APP_BASE_URL) => {
  router.post('/', async (req, res) => {
    try {
      const { personal_id, numbers } = req.body;

      if (!personal_id || typeof personal_id !== 'string' || personal_id.length > 20) {
        return res.status(400).json({ error: 'Invalid personal_id' });
      }

      let nums = [];
      if (Array.isArray(numbers)) {
        nums = numbers.map(Number);
      } else if (typeof numbers === 'string') {
        nums = numbers.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
      } else {
        return res.status(400).json({ error: 'Numbers must be array or comma-separated string' });
      }

      if (nums.length < 6 || nums.length > 10) {
        return res.status(400).json({ error: 'Must provide between 6 and 10 numbers' });
      }
      const duplicates = nums.filter((v, i, a) => a.indexOf(v) !== i);
      if (duplicates.length > 0) {
        return res.status(400).json({ error: 'Duplicate numbers are not allowed' });
      }
      if (nums.some(n => n < 1 || n > 45 || !Number.isInteger(n))) {
        return res.status(400).json({ error: 'Numbers must be integers between 1 and 45' });
      }

      const roundRes = await dbClient.query('SELECT id, uuid FROM rounds WHERE active = true ORDER BY created_at DESC LIMIT 1');
      if (roundRes.rowCount === 0) {
        return res.status(400).json({ error: 'No active round for payments' });
      }
      const round = roundRes.rows[0];

      const insertRes = await dbClient.query(
        `INSERT INTO tickets (round_id, personal_id, numbers) VALUES ($1, $2, $3) RETURNING uuid`,
        [round.id, personal_id, nums]
      );

      const ticketUuid = insertRes.rows[0].uuid;

      //const ticketUrl = `http://localhost:3000/ticket/${ticketUuid}`;
      const ticketUrl = `${APP_BASE_URL}/ticket/${ticketUuid}`;

      const pngBuffer = await QRCode.toBuffer(ticketUrl, { type: 'png', errorCorrectionLevel: 'M' });

      res.set('Content-Type', 'image/png');
      res.send(pngBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/ticket/:uuid', async (req, res) => {
    try {
      const { uuid } = req.params;
      const ticketRes = await dbClient.query(
        `SELECT t.uuid as ticket_uuid, t.personal_id, t.numbers as ticket_numbers, t.created_at,
                r.uuid as round_uuid, r.drawn_numbers
         FROM tickets t
         LEFT JOIN rounds r ON t.round_id = r.id
         WHERE t.uuid = $1`,
        [uuid]
      );
      if (ticketRes.rowCount === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      const row = ticketRes.rows[0];

      res.json({
        ticket_uuid: row.ticket_uuid,
        personal_id: row.personal_id,
        ticket_numbers: row.ticket_numbers,
        created_at: row.created_at,
        round_uuid: row.round_uuid,
        drawn_numbers: row.drawn_numbers
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
