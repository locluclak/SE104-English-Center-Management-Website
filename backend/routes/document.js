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
  const { name, description, course_id, uploadedname} = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !course_id || !filePath || !uploadedname) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  console.log('uploadedname')
  try {
    const sql = `INSERT INTO DOCUMENT (NAME, DESCRIPTION, FILENAME, FILE, COURSE_ID) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [name, description, uploadedname, filePath, course_id]);
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

// GET /documents/download/:id - Download document file by ID
router.get('/download/:id', async (req, res) => {
  const docId = req.params.id;

  try {
    // Fetch the file path of the document from the database
    const [rows] = await db.execute('SELECT FILE FROM DOCUMENT WHERE DOC_ID = ?', [docId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = rows[0].FILE;

    if (!filePath) {
      return res.status(404).json({ error: 'File not found for this document' });
    }

    const fullPath = path.join(__dirname, '../', filePath);

    // Send the file to the client
    res.download(fullPath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (err) {
    console.error('Error fetching document file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /documents/course/:id - Get all document info in a course by course ID (excluding file link)
router.get('/getbycourse/:id', async (req, res) => {
  const courseId = req.params.id;

  try {
    // Fetch document information excluding the file link
    const [rows] = await db.execute(
      'SELECT DOC_ID, NAME, DESCRIPTION, COURSE_ID FROM DOCUMENT WHERE COURSE_ID = ?',
      [courseId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No documents found for this course' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /documents/update/:id - Update document details (excluding course_id)
router.put('/update/:id', async (req, res) => {
  const docId = req.params.id;
  const { name, description } = req.body;

  if (!name && !description) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  try {
    // Build dynamic query for updating fields
    const fields = [];
    const values = [];
    if (name) {
      fields.push('NAME = ?');
      values.push(name);
    }
    if (description) {
      fields.push('DESCRIPTION = ?');
      values.push(description);
    }
    values.push(docId);

    const sql = `UPDATE DOCUMENT SET ${fields.join(', ')} WHERE DOC_ID = ?`;
    const [result] = await db.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document updated successfully' });
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
