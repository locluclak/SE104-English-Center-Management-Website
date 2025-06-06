const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

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

// POST /signup
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

// POST /login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const conn = await db.getConnection();

        // Query the PERSON table to find the user by email
        const [rows] = await conn.query('SELECT * FROM PERSON WHERE EMAIL = ?', [email]);

        if (rows.length === 0) {
            conn.release();
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.PASSWORD);

        if (!match) {
            conn.release();
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        let role = 'STUDENT'; // Default role is STUDENT

        // If the user is a staff member, query the STAFF table for their staff_type
        if (user.ROLE === 'STAFF') {
            const [staffRows] = await conn.query('SELECT STAFF_TYPE FROM STAFF WHERE ID = ?', [user.ID]);
            if (staffRows.length > 0) {
                role = staffRows[0].STAFF_TYPE; // Set role to the staff_type (e.g., TEACHER, ADMIN, ACCOUNTANT)
            }
        }

        conn.release();

        // Generate a JWT token
        const token = jwt.sign(
            { id: user.ID, email: user.EMAIL, role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        // Respond with the token and role
        res.json({
            message: 'Login successful',
            token,
            role
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /change-password
router.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const conn = await db.getConnection();

        // Query the PERSON table to find the user by email
        const [rows] = await conn.query('SELECT * FROM PERSON WHERE EMAIL = ?', [email]);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(oldPassword, user.PASSWORD);

        if (!match) {
            conn.release();
            return res.status(401).json({ message: 'Incorrect old password' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await conn.query('UPDATE PERSON SET PASSWORD = ? WHERE EMAIL = ?', [hashedPassword, email]);

        conn.release();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
