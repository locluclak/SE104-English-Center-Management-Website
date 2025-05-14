const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /person?email=...
router.get('/', async (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }

    try {
        const conn = await db.getConnection();
        const [rows] = await conn.query('SELECT * FROM PERSON WHERE EMAIL = ?', [email]);
        conn.release();

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Person not found' });
        }

        const user = rows[0];
        delete user.PASSWORD; // ❌ remove password field

        res.json(user);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
