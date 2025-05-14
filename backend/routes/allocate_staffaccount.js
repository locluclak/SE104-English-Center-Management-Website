const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Helper: Generate simple alphanumeric password
function generatePassword(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// POST /staff/allocate
router.post('/allocate', async (req, res) => {
    const { name, email, phone_number, date_of_birth, hire_day, staff_type } = req.body;

    if (!name || !email || !phone_number || !date_of_birth || !hire_day || !staff_type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const conn = await db.getConnection();

        // Check if email already exists
        const [existing] = await conn.query('SELECT * FROM PERSON WHERE EMAIL = ?', [email]);
        if (existing.length > 0) {
            conn.release();
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Generate and hash password
        const rawPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Insert into PERSON
        const [personResult] = await conn.query(
            `INSERT INTO PERSON (NAME, EMAIL, PHONE_NUMBER, DATE_OF_BIRTH, ROLE, PASSWORD)
             VALUES (?, ?, ?, ?, 'STAFF', ?)`,
            [name, email, phone_number, date_of_birth, hashedPassword]
        );

        const personId = personResult.insertId;

        // Insert into STAFF
        await conn.query(
            `INSERT INTO STAFF (ID, HIRE_DAY, STAFF_TYPE) VALUES (?, ?, ?)`,
            [personId, hire_day, staff_type]
        );

        conn.release();

        res.status(201).json({
            message: 'Staff account allocated successfully',
            email,
            password: rawPassword
        });

    } catch (err) {
        console.error('Error allocating staff account:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
