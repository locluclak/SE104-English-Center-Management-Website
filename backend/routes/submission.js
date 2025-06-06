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

// POST /submission/upload - Upload a new submission
router.post('/upload', async (req, res) => {
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'File upload error' });
    }

    const { student_id, assignment_id, description } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate required fields
    if (!student_id || !assignment_id || !filePath) {
      return res.status(400).json({ error: 'Missing required fields: student_id, assignment_id, or file' });
    }

    try {
      const conn = await db.getConnection();

      // Check if a submission already exists for the same student and assignment
      const [existingSubmission] = await conn.query(
        'SELECT * FROM SUBMITION WHERE STUDENT_ID = ? AND AS_ID = ?',
        [student_id, assignment_id]
      );

      if (existingSubmission.length > 0) {
        conn.release();
        // Remove the uploaded file if submission already exists
        fs.unlinkSync(path.join(__dirname, `../uploads/${req.file.filename}`));
        return res.status(409).json({ error: 'Submission already exists for this assignment' });
      }

      // Check if the current time is within the assignment's start and end time
      const [assignmentRows] = await conn.query(
        'SELECT START_DATE, END_DATE FROM ASSIGNMENT WHERE AS_ID = ?',
        [assignment_id]
      );

      if (assignmentRows.length === 0) {
        conn.release();
        // Remove the uploaded file if the assignment is not found
        fs.unlinkSync(path.join(__dirname, `../uploads/${req.file.filename}`));
        return res.status(404).json({ error: 'Assignment not found' });
      }

      const { START_DATE, END_DATE } = assignmentRows[0];
      const currentTime = new Date();

      if (currentTime < new Date(START_DATE) || currentTime > new Date(END_DATE)) {
        conn.release();
        // Remove the uploaded file if submission is outside the allowed time frame
        fs.unlinkSync(path.join(__dirname, `../uploads/${req.file.filename}`));
        return res.status(400).json({ error: 'Submission is not allowed outside the assignment time frame' });
      }

      // Insert the submission into the database
      const sql = `
        INSERT INTO SUBMITION (STUDENT_ID, AS_ID, SUBMIT_DATE, DESCRIPTION, FILE)
        VALUES (?, ?, NOW(), ?, ?)
      `;
      await conn.query(sql, [student_id, assignment_id, description || null, filePath]);

      conn.release();
      res.status(201).json({ message: 'Submission uploaded successfully' });
    } catch (err) {
      console.error('Error uploading submission:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// DELETE /submission/delete/:student_id/:assignment_id - Delete a submission and its file
router.delete('/delete/:student_id/:assignment_id', async (req, res) => {
  const { student_id, assignment_id } = req.params;

  try {
    const conn = await db.getConnection();

    // Fetch the file path of the submission from the database
    const [rows] = await conn.query(
      'SELECT FILE FROM SUBMITION WHERE STUDENT_ID = ? AND AS_ID = ?',
      [student_id, assignment_id]
    );

    

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Submission not found' });
    }

    const filePath = rows[0].FILE;

    // Delete the submission from the database
    const [result] = await conn.query(
      'DELETE FROM SUBMITION WHERE STUDENT_ID = ? AND AS_ID = ?',
      [student_id, assignment_id]
    );

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Remove the file from the uploads directory
    if (filePath) {
      const fullPath = path.join(__dirname, '../', filePath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (err) {
    console.error('Error deleting submission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/update/:student_id/:assignment_id', async (req, res) => {
  const { student_id, assignment_id } = req.params;
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'File upload error' });
    }

    const { description } = req.body;
    const newFilePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const conn = await db.getConnection();

      // Fetch the existing submission
      const [rows] = await conn.query(
        'SELECT FILE FROM SUBMITION WHERE STUDENT_ID = ? AND AS_ID = ?',
        [student_id, assignment_id]
      );

      if (rows.length === 0) {
        conn.release();
        // Remove the uploaded file if submission does not exist
        if (newFilePath) {
          fs.unlinkSync(path.join(__dirname, `../uploads/${req.file.filename}`));
        }
        return res.status(404).json({ error: 'Submission not found' });
      }

      const oldFilePath = rows[0].FILE;

      // Update the submission in the database
      const sql = `
        UPDATE SUBMITION
        SET DESCRIPTION = ?, FILE = ?, SUBMIT_DATE = NOW()
        WHERE STUDENT_ID = ? AND AS_ID = ?
      `;
      await conn.query(sql, [description || null, newFilePath || oldFilePath, student_id, assignment_id]);

      conn.release();

      // Remove the old file if a new file was uploaded
      if (newFilePath && oldFilePath) {
        const fullPath = path.join(__dirname, '../', oldFilePath);
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error('Error deleting old file:', err);
          }
        });
      }

      res.status(200).json({ message: 'Submission updated successfully' });
    } catch (err) {
      console.error('Error updating submission:', err);
      // Remove the uploaded file if an error occurs
      if (newFilePath) {
        fs.unlinkSync(path.join(__dirname, `../uploads/${req.file.filename}`));
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

module.exports = router;