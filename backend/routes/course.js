const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// Route to create a new course
router.post('/create', async (req, res) => {
  const { name, description, startDate, endDate, minStu, maxStu } = req.body;

  // Validate input
  if (!name || !startDate || !endDate || !minStu || !maxStu) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO COURSE (NAME, DESCRIPTION, START_DATE, END_DATE, MIN_STU, MAX_STU)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, description, startDate, endDate, minStu, maxStu]);

    res.status(201).json({ message: 'Course created successfully', courseId: result.insertId });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to add a teacher to a course
router.post('/add-teacher', async (req, res) => {
  const { teacherId, courseId, role } = req.body;

  // Validate input
  if (!teacherId || !courseId || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO TEACHER_COURSE (TEACHER_ID, COURSE_ID, ROLE)
      VALUES (?, ?, ?)
    `;
    await db.execute(query, [teacherId, courseId, role]);

    res.status(201).json({ message: 'Teacher added to course successfully' });
  } catch (error) {
    console.error('Error adding teacher to course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;