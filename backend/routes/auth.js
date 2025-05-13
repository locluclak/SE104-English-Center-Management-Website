const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // ✅ Using your shared db config
require('dotenv').config();

const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
    const { name, email, phone_number, date_of_birth, role, password } = req.body;

    try {
        const conn = await db.getConnection();

        const [existing] = await conn.query('SELECT * FROM PERSON WHERE EMAIL = ?', [email]);
        if (existing.length > 0) {
            conn.release();
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [personResult] = await conn.query(
            `INSERT INTO PERSON (NAME, EMAIL, PHONE_NUMBER, DATE_OF_BIRTH, ROLE, PASSWORD)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, phone_number, date_of_birth, role || 'STUDENT', hashedPassword]
        );

        const personId = personResult.insertId;

        if ((role || 'STUDENT') === 'STUDENT') {
            await conn.query(
                `INSERT INTO STUDENT (ID, ENROLL_DATE) VALUES (?, CURDATE())`,
                [personId]
            );
        }

        conn.release();
        res.status(201).json({ message: 'Signup successful', id: personId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const conn = await db.getConnection();

        const [rows] = await conn.query('SELECT * FROM PERSON WHERE EMAIL = ?', [email]);
        conn.release();

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.PASSWORD);

        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.ID, email: user.EMAIL, role: user.ROLE },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
