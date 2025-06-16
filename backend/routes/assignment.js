const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate unique filename
  }
});

const upload = multer({ storage: storage });

// POST /assignments/upload - Upload a new assignment
router.post('/upload', upload.single('file'), async (req, res) => {
  const { name, description, start_date, end_date, uploadedname, course_id } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !start_date || !end_date || !course_id) {
    return res.status(400).json({ error: 'Missing required fields: name, start_date, end_date, or course_id' });
  }

  try {
    const sql = `
      INSERT INTO ASSIGNMENT (NAME, DESCRIPTION, FILENAME, FILE, START_DATE, END_DATE, COURSE_ID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      name,
      description || null, // Use null if description is not provided
      uploadedname,
      filePath || null, // File path can be null if no file is uploaded
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
          console.error('Error deleting file from filesystem:', err);
          // Log error but don't prevent DB deletion if file system delete fails
        } else {
          console.log(`Deleted file: ${fullPath}`);
        }
      });
    }

    // Delete the assignment from the database
    const [result] = await db.execute('DELETE FROM ASSIGNMENT WHERE AS_ID = ?', [assignmentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found in database after file deletion attempt' });
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
    const [rows] = await db.execute('SELECT FILE, FILENAME FROM ASSIGNMENT WHERE AS_ID = ?', [assignmentId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const filePath = rows[0].FILE;
    const originalFileName = rows[0].FILENAME;

    if (!filePath) {
      return res.status(404).json({ error: 'File not found for this assignment' });
    }

    const fullPath = path.join(__dirname, '../', filePath);

    // Send the file to the client using the original file name
    res.download(fullPath, originalFileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        // Check if the error is due to file not found on disk
        if (err.code === 'ENOENT') {
          return res.status(404).json({ error: 'File not found on server.' });
        }
        res.status(500).json({ error: 'Internal server error during download' });
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
      return res.status(200).json({ message: 'No assignments found for this course', assignments: [] }); // Return empty array for consistency
    }

    res.status(200).json({ assignments: rows });
  } catch (err) {
    console.error('Error fetching assignments by course:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /assignments/all - Get all assignments
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT AS_ID, NAME, DESCRIPTION, START_DATE, END_DATE, COURSE_ID FROM ASSIGNMENT');
    res.status(200).json({ assignments: rows });
  } catch (error) {
    console.error('Error fetching all assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /assignments/update/:id - Update assignment details and optionally replace file
router.put('/update/:id', upload.array('attachments'), async (req, res) => {
  const assignmentId = req.params.id;
  const { title, description, dueDate } = req.body;

  let newFilePath = null;
  let newFileName = null;

  if (req.files && req.files.length > 0) {
    const uploadedFile = req.files[0];
    newFilePath = `/uploads/${uploadedFile.filename}`;
    newFileName = uploadedFile.originalname;
  }

  try {
    const fields = [];
    const values = [];

    // --- Fetch current assignment details to get existing file path for deletion ---
    let oldFilePath = null;
    let oldFileName = null;
    const [currentAssignmentRows] = await db.execute('SELECT FILE, FILENAME FROM ASSIGNMENT WHERE AS_ID = ?', [assignmentId]);
    if (currentAssignmentRows.length > 0) {
      oldFilePath = currentAssignmentRows[0].FILE;
      oldFileName = currentAssignmentRows[0].FILENAME;
    } else {
      return res.status(404).json({ message: 'Assignment not found.' }); // If assignment doesn't exist, return 404 early
    }

    if (title !== undefined) {
      fields.push('NAME = ?');
      values.push(title);
    }
    if (description !== undefined) {
      fields.push('DESCRIPTION = ?');
      values.push(description);
    }
    if (dueDate !== undefined) { 
      fields.push('END_DATE = ?');
      values.push(dueDate);
    }

    // --- Handle file attachment update logic ---
    if (newFilePath) {
      fields.push('FILE = ?');
      values.push(newFilePath);
      fields.push('FILENAME = ?');
      values.push(newFileName);

      // Delete the old file from the filesystem if it existed
      if (oldFilePath) {
        const fullOldPath = path.join(__dirname, '../', oldFilePath);
        if (fs.existsSync(fullOldPath)) {
          fs.unlink(fullOldPath, (err) => {
            if (err) {
              console.error(`Error deleting old file ${fullOldPath}:`, err);
              // Log the error but continue the database update
            } else {
              console.log(`Old file ${fullOldPath} deleted.`);
            }
          });
        } else {
          console.warn(`Old file ${fullOldPath} not found on disk for deletion. Continuing update.`);
        }
      }
    }

    // If no fields to update and no new file was provided, return 400
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update or no new file provided.' });
    }

    // Add assignmentId to values for the WHERE clause
    values.push(assignmentId);

    const sql = `UPDATE ASSIGNMENT SET ${fields.join(', ')} WHERE AS_ID = ?`;
    const [result] = await db.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Assignment found but could not be updated.' });
    }

    res.json({ message: 'Assignment updated successfully.' });

  } catch (err) {
    console.error('Error updating assignment:', err);
    if (newFilePath) {
      const fullNewPath = path.join(__dirname, '../', newFilePath);
      if (fs.existsSync(fullNewPath)) {
        fs.unlink(fullNewPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting newly uploaded file after failed DB update:', unlinkErr);
          }
        });
      }
    }
  res.status(500).json({ error: 'Internal server error' });
  }
});

//Get assignment progress for a teacher
router.get('/teacher/:teacherId/progress', async (req, res) => {
  const teacherId = req.params.teacherId;

  if (!teacherId) {
    return res.status(400).json({ error: 'Teacher ID is required' });
  }

  try {
    const query = `
      SELECT
        A.AS_ID AS id,
        A.NAME AS title,
        A.DESCRIPTION AS description,
        A.END_DATE AS dueDate,
        C.COURSE_ID AS courseId,
        C.NAME AS courseName,
        C.NUMBER_STU AS totalStudents, -- Renamed for clarity to match frontend type
        COUNT(S.STUDENT_ID) AS submissionsCount -- Submissions for this specific assignment
      FROM ASSIGNMENT A
      JOIN COURSE C ON A.COURSE_ID = C.COURSE_ID
      JOIN TEACHER_COURSE TC ON C.COURSE_ID = TC.COURSE_ID
      LEFT JOIN SUBMITION S ON A.AS_ID = S.AS_ID
      WHERE TC.TEACHER_ID = ?
      GROUP BY A.AS_ID, A.NAME, A.DESCRIPTION, A.END_DATE, C.COURSE_ID, C.NAME, C.NUMBER_STU
      ORDER BY A.END_DATE ASC;
    `;
    const [assignments] = await db.execute(query, [teacherId]);

    const now = new Date();
    const upcomingAssignments = assignments.filter(assignment => {
      const assignmentDueDate = new Date(assignment.dueDate);
      assignmentDueDate.setHours(23, 59, 59, 999); // Set to end of day for consistent comparison
      return assignmentDueDate >= now;
    });

    res.status(200).json(upcomingAssignments);
  } catch (error) {
    console.error('Error fetching teacher assignment progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
