const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Save files to ./uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate unique filename
  }
});

const upload = multer({ storage: storage });

// POST /assignments/upload - Upload a new assignment
router.post('/upload', upload.single('file'), async (req, res) => {
  const { name, description, start_date, end_date, course_id } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  // Validate required fields
  if (!name || !start_date || !end_date || !course_id) {
    return res.status(400).json({ error: 'Missing required fields: name, start_date, end_date, or course_id' });
  }

  try {
    const sql = `
      INSERT INTO ASSIGNMENT (NAME, DESCRIPTION, FILE, START_DATE, END_DATE, COURSE_ID)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      name,
      description || null, // Use null if description is not provided
      filePath, // File path can be null if no file is uploaded
      start_date,
      end_date,
      course_id
    ]);

    res.status(201).json({ message: 'Assignment uploaded successfully', assignmentId: result.insertId });
  } catch (err) {
    console.error('Error uploading assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /assignments/delete/:id - Delete an assignment by ID
router.delete('/delete/:id', async (req, res) => {
  const assignmentId = req.params.id;

  try {
    // Fetch the file path of the assignment from the database
    const [rows] = await db.execute('SELECT FILE FROM ASSIGNMENT WHERE AS_ID = ?', [assignmentId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const filePath = rows[0].FILE;

    // Delete the file from the uploads directory
    if (filePath) {
      const fullPath = path.join(__dirname, '../', filePath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    // Delete the assignment from the database
    const [result] = await db.execute('DELETE FROM ASSIGNMENT WHERE AS_ID = ?', [assignmentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /assignments/download/:id - Download an assignment file by ID
router.get('/download/:id', async (req, res) => {
  const assignmentId = req.params.id;

  try {
    // Fetch the file path of the assignment from the database
    const [rows] = await db.execute('SELECT FILE FROM ASSIGNMENT WHERE AS_ID = ?', [assignmentId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const filePath = rows[0].FILE;

    if (!filePath) {
      return res.status(404).json({ error: 'File not found for this assignment' });
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
    console.error('Error fetching assignment file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /assignments/course/:courseId - Get all assignments in a course by course ID
router.get('/getbycourse/:courseId', async (req, res) => {
  const courseId = req.params.courseId;

  try {
    // Fetch all assignments for the given course ID, excluding the FILE field
    const [rows] = await db.execute(
      'SELECT AS_ID, NAME, DESCRIPTION, START_DATE, END_DATE FROM ASSIGNMENT WHERE COURSE_ID = ?',
      [courseId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No assignments found for this course' });
    }

    res.status(200).json({ assignments: rows });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW ROUTE: GET /assignments/all - Get all assignments
router.get('/all', async (req, res) => {
  try {
      // Include COURSE_ID for frontend mapping
      const [rows] = await db.execute('SELECT AS_ID, NAME, DESCRIPTION, START_DATE, END_DATE, COURSE_ID FROM ASSIGNMENT');
      // Ensure the response structure matches what frontend expects: data.assignments
      res.status(200).json({ assignments: rows });
  } catch (error) {
      console.error('Error fetching all assignments:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /assignments/update/:id - Update assignment details (excluding course_id)
router.put('/update/:id', async (req, res) => {
  const assignmentId = req.params.id;
  const { name, description, start_date, end_date } = req.body;

  if (!name && !description && !start_date && !end_date) {
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
    if (start_date) {
      fields.push('START_DATE = ?');
      values.push(start_date);
    }
    if (end_date) {
      fields.push('END_DATE = ?');
      values.push(end_date);
    }
    values.push(assignmentId);

    const sql = `UPDATE ASSIGNMENT SET ${fields.join(', ')} WHERE AS_ID = ?`;
    const [result] = await db.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ message: 'Assignment updated successfully' });
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;