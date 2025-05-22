const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST /documents - Upload document
router.post('/', upload.single('file'), async (req, res) => {
  const { name, description, course_id } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !course_id || !filePath) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sql = `INSERT INTO DOCUMENT (NAME, DESCRIPTION, FILE, COURSE_ID) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [name, description, filePath, course_id]);
    res.status(201).json({ message: 'Document uploaded', doc_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
