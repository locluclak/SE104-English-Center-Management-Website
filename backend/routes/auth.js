const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// sign up
router.post('/signup', async (req, res) => {
  const { name, email, password, phoneNumber, dateOfBirth, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO PERSON (NAME, EMAIL, PASSWORD, PHONE_NUMBER, DATE_OF_BIRTH, ROLE)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  // console.log("call signup")
  db.query(
    sql,
    [name, email, hashedPassword, phoneNumber, dateOfBirth, role || 'STUDENT'],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email exists' });
        }
        return res.status(500).json({ error: 'System error' });
      }
      return res.status(200).json({ message: 'Registration successful!' });
    }
  );
});

// login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM PERSON WHERE EMAIL = ?';
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(400).json({ error: 'Incorrect email or password' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.PASSWORD);
    if (!match)
      return res.status(400).json({ error: 'Incorrect email or password' });

    const token = jwt.sign(
      { id: user.ID, role: user.ROLE },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.ID, name: user.NAME, role: user.ROLE }
    });
  });
});

module.exports = router;
