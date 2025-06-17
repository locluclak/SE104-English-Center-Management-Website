const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');
const { Parser } = require('json2csv');

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

    const { student_id, assignment_id, description, uploadedname } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate required fields
    if (!student_id || !assignment_id ) {
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
        return res.status(405).json({ error: 'Submission is not allowed outside the assignment time frame' });
      }

      // Insert the submission into the database
      const sql = `
        INSERT INTO SUBMITION (STUDENT_ID, AS_ID, SUBMIT_DATE, DESCRIPTION, FILE, FILENAME)
        VALUES (?, ?, NOW(), ?, ?, ?)
      `;
      await conn.query(sql, [student_id, assignment_id, description || null, filePath, uploadedname]);

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
      const [assignment] = await db.query(
          'SELECT START_DATE, END_DATE FROM ASSIGNMENT WHERE AS_ID = ?',
          [assignment_id]
      );

      if (!assignment) {
          return res.status(404).json({ message: 'Assignment not found' });
      }

      const currentTime = new Date();
      const startDate = new Date(assignment.START_DATE);
      const endDate = new Date(assignment.END_DATE);

      // Check if the current time is within the allowed time frame
      if (currentTime < startDate || currentTime > endDate) {
          return res.status(403).json({ message: 'Submission update is not allowed outside the assignment time frame' });
      }
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

router.get('/submissions_byassignment/:assignmentId', async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const conn = await db.getConnection();

    // Query to fetch submissions and student details for the given assignment ID
    const query = `
      SELECT 
        s.STUDENT_ID, 
        p.NAME AS STUDENT_NAME, 
        s.SUBMIT_DATE, 
        s.DESCRIPTION AS SUBMISSION_DESCRIPTION, 
        s.FILE AS SUBMISSION_FILE, 
        s.SCORE
      FROM SUBMITION s
      JOIN PERSON p ON s.STUDENT_ID = p.ID
      WHERE s.AS_ID = ?
    `;
    const [rows] = await conn.query(query, [assignmentId]);

    conn.release();

    if (rows.length === 0) {
      return res.status(200).json({ message: 'No submissions found for this assignment' });
    }

    res.status(200).json({ submissions: rows });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /submission/score/:student_id/:assignment_id - Score a submission
router.put('/score/:student_id/:assignment_id', async (req, res) => {
  const { student_id, assignment_id } = req.params;
  const { score } = req.body;

  // Validate the score
  if (score === undefined || isNaN(score) || score < 0 || score > 100) {
    return res.status(400).json({ error: 'Invalid score. Score must be a number between 0 and 100.' });
  }

  try {
    const conn = await db.getConnection();

    // Check if the submission exists
    const [rows] = await conn.query(
      'SELECT * FROM SUBMITION WHERE STUDENT_ID = ? AND AS_ID = ?',
      [student_id, assignment_id]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Update the score for the submission
    const sql = `
      UPDATE SUBMITION
      SET SCORE = ?
      WHERE STUDENT_ID = ? AND AS_ID = ?
    `;
    await conn.query(sql, [score, student_id, assignment_id]);

    conn.release();
    res.status(200).json({ message: 'Score updated successfully' });
  } catch (err) {
    console.error('Error scoring submission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /submission/report/:assignment_id - Get report of submissions for an assignment
router.get('/report/:assignment_id', async (req, res) => {
  const { assignment_id } = req.params;

  try {
    const conn = await db.getConnection();

    // Query to fetch submission details along with student information (excluding phone number)
    const query = `
      SELECT 
        s.SUBMIT_DATE, 
        s.SCORE, 
        p.NAME AS STUDENT_NAME, 
        p.EMAIL AS STUDENT_EMAIL
      FROM SUBMITION s
      JOIN PERSON p ON s.STUDENT_ID = p.ID
      WHERE s.AS_ID = ?
    `;
    const [rows] = await conn.query(query, [assignment_id]);

    conn.release();

    if (rows.length === 0) {
      return res.status(200).json({ report: [], message: 'No submissions yet for this assignment.' });
    }


    res.status(200).json({ report: rows });
  } catch (err) {
    console.error('Error fetching assignment report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /submission/course_report/:course_id - Get report of a course including scores of all assignments for all students
router.get('/course_report/:course_id', async (req, res) => {
  const { course_id } = req.params;

  try {
    const conn = await db.getConnection();

    // Query to fetch student names and scores for all assignments in the course
    const query = `
      SELECT 
        p.NAME AS STUDENT_NAME, 
        a.NAME AS ASSIGNMENT_NAME, 
        s.SCORE
      FROM SUBMITION s
      JOIN PERSON p ON s.STUDENT_ID = p.ID
      JOIN ASSIGNMENT a ON s.AS_ID = a.AS_ID
      WHERE a.COURSE_ID = ?
    `;

    const [rows] = await conn.query(query, [course_id]);

    conn.release();

    if (rows.length === 0) {
      return res.status(200).json({ report: [], message: 'No submissions yet for this course.' });
    }

    res.status(200).json({ report: rows });
  } catch (err) {
    console.error('Error fetching course report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by_course/:course_id', async (req, res) => {
  const { course_id } = req.params;

  try {
    const conn = await db.getConnection();

    const [rows] = await conn.query(
      'SELECT AS_ID, NAME FROM ASSIGNMENT WHERE COURSE_ID = ?',
      [course_id]
    );

    conn.release();

    if (rows.length === 0) {
      return res.status(200).json({ report: [], message: 'No submissions yet for this assignment.' });
    }
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching assignments by course:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /submission/export_csv_course/:course_id - Export course report as CSV with each row representing a student and their scores
router.get('/export_csv_course/:course_id', async (req, res) => {
  const { course_id } = req.params;

  try {
    const conn = await db.getConnection();

    // Query to fetch student names and scores for all assignments in the course
    const query = `
      SELECT 
        p.NAME AS STUDENT_NAME, 
        a.NAME AS ASSIGNMENT_NAME, 
        s.SCORE
      FROM SUBMITION s
      JOIN PERSON p ON s.STUDENT_ID = p.ID
      JOIN ASSIGNMENT a ON s.AS_ID = a.AS_ID
      WHERE a.COURSE_ID = ?
      ORDER BY p.NAME, a.NAME
    `;

    const [rows] = await conn.query(query, [course_id]);

    conn.release();

    if (rows.length === 0) {
      return res.status(200).json({ message: 'No submissions yet for this course.', report: [] });
    }


    // Group scores by student
    const groupedData = {};
    rows.forEach(row => {
      if (!groupedData[row.STUDENT_NAME]) {
        groupedData[row.STUDENT_NAME] = { STUDENT_NAME: row.STUDENT_NAME };
      }
      groupedData[row.STUDENT_NAME][row.ASSIGNMENT_NAME] = row.SCORE;
    });

    // Convert grouped data to an array for CSV export
    const csvData = Object.values(groupedData);

    // Extract assignment names for dynamic CSV headers
    const assignmentNames = [...new Set(rows.map(row => row.ASSIGNMENT_NAME))];
    const fields = ['STUDENT_NAME', ...assignmentNames];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Set headers and send the CSV file
    res.header('Content-Type', 'text/csv');
    res.attachment(`course_${course_id}_report.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting course report as CSV:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /submission/export_csv_assignment/:assignment_id - Export assignment report as CSV
router.get('/export_csv_assignment/:assignment_id', async (req, res) => {
  const { assignment_id } = req.params;

  try {
    const conn = await db.getConnection();
    const query = `
      SELECT
        p.NAME AS STUDENT_NAME,
        p.EMAIL AS STUDENT_EMAIL,
        s.SUBMIT_DATE,
        s.SCORE
      FROM SUBMITION s
      JOIN PERSON p ON s.STUDENT_ID = p.ID
      WHERE s.AS_ID = ?
      ORDER BY p.NAME
    `;
    const [rows] = await conn.query(query, [assignment_id]);
    conn.release();

    if (rows.length === 0) {
      res.header('Content-Type', 'text/csv');
      res.attachment(`assignment_${assignment_id}_report.csv`);
      return res.status(200).send('STUDENT_NAME,STUDENT_EMAIL,SUBMIT_DATE,SCORE\n');
    }

    const fields = ['STUDENT_NAME', 'STUDENT_EMAIL', 'SUBMIT_DATE', 'SCORE'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment(`assignment_${assignment_id}_report.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting assignment report as CSV:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;