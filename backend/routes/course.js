const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// Route to create a new course
router.post('/create', async (req, res) => {
  const { name, teacherName, description, startDate, endDate, minStu, maxStu, price } = req.body;
  const fullDescription = teacherName ? `[Giáo viên: ${teacherName}] ${description || ''}` : description;

  if (!name || !startDate || !endDate || !minStu || !maxStu) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO COURSE (NAME, DESCRIPTION, START_DATE, END_DATE, MIN_STU, MAX_STU, PRICE)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      name,
      fullDescription,
      startDate,
      endDate,
      minStu,
      maxStu,
      price !== undefined ? price : 0
    ]);

    res.status(201).json({ message: 'Course created successfully', courseId: result.insertId });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to get all courses
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM COURSE');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get course information by ID
router.get('/:id', async (req, res) => {
  const courseId = req.params.id;

  try {
    const query = `
      SELECT * FROM COURSE WHERE COURSE_ID = ?
    `;
    const [rows] = await db.execute(query, [courseId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching course:', error);
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

// Route to delete a teacher from a course by teacherId and courseId
router.delete('/remove-teacher', async (req, res) => {
  const { teacherId, courseId } = req.body;

  // Validate input
  if (!teacherId || !courseId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const query = `
      DELETE FROM TEACHER_COURSE
      WHERE TEACHER_ID = ? AND COURSE_ID = ?
    `;
    const [result] = await db.execute(query, [teacherId, courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Teacher not found in this course' });
    }

    res.status(200).json({ message: 'Teacher removed from course successfully' });
  } catch (error) {
    console.error('Error removing teacher from course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to add a student to a course and create a payment record
router.post('/add-student', async (req, res) => {
  const { studentId, courseId, paymentType, paymentDescription } = req.body;

  // Validate input
  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get course price for payment
    const [courseRows] = await connection.execute(
      'SELECT PRICE FROM COURSE WHERE COURSE_ID = ?',
      [courseId]
    );
    if (courseRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Course not found' });
    }
    const coursePrice = courseRows[0].PRICE;

    // Create payment record
    const tuitionQuery = `
      INSERT INTO TUITION (PRICE, TYPE, DESCRIPTION, STATUS)
      VALUES (?, ?, ?, 'UNPAID')
    `;
    const [tuitionResult] = await connection.execute(
      tuitionQuery,
      [
        coursePrice,
        paymentType || 'UNPAID',
        paymentDescription || ''
      ]
    );
    const paymentId = tuitionResult.insertId;

    // Add student to course
    const studentCourseQuery = `
      INSERT INTO STUDENT_COURSE (STUDENT_ID, COURSE_ID, PAYMENT_ID)
      VALUES (?, ?, ?)
    `;
    await connection.execute(studentCourseQuery, [studentId, courseId, paymentId]);

    await connection.commit();
    res.status(201).json({ message: 'Student added to course and payment created successfully' });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student already enrolled in this course' });
    }
    console.error('Error adding student to course:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Route to update a course by ID
router.put('/update/:id', async (req, res) => {
  const courseId = req.params.id;
  const { name, description, startDate, endDate, minStu, maxStu, price, teacherName } = req.body;

  if (!name && !description && !startDate && !endDate && !minStu && !maxStu && price === undefined && !teacherName) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  const updatedDescription = teacherName
    ? `[Giáo viên: ${teacherName}] ${description || ''}`
    : description;

  try {
    const query = `
      UPDATE COURSE
      SET 
        NAME = COALESCE(?, NAME),
        DESCRIPTION = COALESCE(?, DESCRIPTION),
        START_DATE = COALESCE(?, START_DATE),
        END_DATE = COALESCE(?, END_DATE),
        MIN_STU = COALESCE(?, MIN_STU),
        MAX_STU = COALESCE(?, MAX_STU),
        PRICE = COALESCE(?, PRICE)
      WHERE COURSE_ID = ?
    `;

    const [result] = await db.execute(query, [
      name || null,
      updatedDescription || null,
      startDate || null,
      endDate || null,
      minStu || null,
      maxStu || null,
      price !== undefined ? price : null,
      courseId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;