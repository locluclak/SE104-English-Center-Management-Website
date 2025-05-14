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

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ message: 'Person not found' });
        }

        const user = rows[0];
        delete user.PASSWORD; // Remove password field

        // If the user is STAFF, fetch their specific role
        if (user.ROLE === 'STAFF') {
            const [staffRows] = await conn.query('SELECT STAFF_TYPE FROM STAFF WHERE ID = ?', [user.ID]);
            if (staffRows.length > 0) {
                user.ROLE = staffRows[0].STAFF_TYPE; // Replace ROLE with specific staff type
            }
        }

        conn.release();
        res.json(user);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
