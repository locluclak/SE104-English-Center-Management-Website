const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');

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

// DELETE /documents/delete/:id - Delete document by ID and its file
router.delete('/delete/:id', async (req, res) => {
  const docId = req.params.id;
  try {
    // Get file path from DB
    const [rows] = await db.execute('SELECT FILE FROM DOCUMENT WHERE DOC_ID = ?', [docId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const filePath = rows[0].FILE;
    // Remove file from uploads if exists
    if (filePath) {
      const fullPath = path.join(uploadsDir, path.basename(filePath));
      fs.unlink(fullPath, (err) => {
        // Ignore error if file does not exist
      });
    }
    // Delete document from DB
    const [result] = await db.execute('DELETE FROM DOCUMENT WHERE DOC_ID = ?', [docId]);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
