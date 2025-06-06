const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// Route to create a new course
router.post('/create', async (req, res) => {
<<<<<<< HEAD
<<<<<<< HEAD
  const { name, teacherName, description, startDate, endDate, minStu, maxStu, price } = req.body;
  const fullDescription = teacherName ? `[Giáo viên: ${teacherName}] ${description || ''}` : description;

=======
  const { name, description, startDate, endDate, minStu, maxStu, price } = req.body;

  // Validate input
>>>>>>> beebbb895 (update backend)
=======
  const { name, teacherName, description, startDate, endDate, minStu, maxStu, price } = req.body;
  const fullDescription = teacherName ? `[Giáo viên: ${teacherName}] ${description || ''}` : description;

>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
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
<<<<<<< HEAD
<<<<<<< HEAD
      fullDescription,
=======
      description,
>>>>>>> beebbb895 (update backend)
=======
      fullDescription,
>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
      startDate,
      endDate,
      minStu,
      maxStu,
<<<<<<< HEAD
<<<<<<< HEAD
      price !== undefined ? price : 0
=======
      price !== undefined ? price : 0 // Default to 0 if not provided
>>>>>>> beebbb895 (update backend)
=======
      price !== undefined ? price : 0
>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
    ]);

    res.status(201).json({ message: 'Course created successfully', courseId: result.insertId });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
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

// Route to get course information by ID AND its students
<<<<<<< HEAD
router.get('/:id', async (req, res) => {
  const courseId = req.params.id;
  try {
      // Lấy thông tin cơ bản của khóa học
      const courseQuery = `
          SELECT * FROM COURSE WHERE COURSE_ID = ?
      `;
      const [courseRows] = await db.execute(courseQuery, [courseId]);

      if (courseRows.length === 0) {
          return res.status(404).json({ error: 'Course not found' });
      }
      const courseInfo = courseRows[0];
      // Lấy danh sách học viên của khóa học
      const studentsQuery = `
          SELECT
              P.ID, P.NAME, P.EMAIL, P.PHONE_NUMBER, P.DATE_OF_BIRTH, S.ENROLL_DATE
          FROM STUDENT_COURSE SC
          JOIN STUDENT S ON SC.STUDENT_ID = S.ID
          JOIN PERSON P ON S.ID = P.ID
          WHERE SC.COURSE_ID = ?
      `;
      const [studentsInCourse] = await db.execute(studentsQuery, [courseId]);
      // Gộp thông tin khóa học và danh sách học viên lại
      const responseData = {
          ...courseInfo,
          STUDENTS: studentsInCourse.map(student => ({
              ID: student.ID,
              NAME: student.NAME,
              EMAIL: student.EMAIL,
              // Thêm các trường khác của học viên nếu cần
          })),
      };
      res.status(200).json(responseData);
  } catch (error) {
      console.error('Error fetching course and students:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get list of students in a course
router.get('/:id/students', async (req, res) => {
  const courseId = req.params.id;

  try {
    const query = `
      SELECT 
        P.ID, P.NAME, P.EMAIL, P.PHONE_NUMBER, P.DATE_OF_BIRTH, S.ENROLL_DATE, T.STATUS AS PAYMENT_STATUS
      FROM STUDENT_COURSE SC
      JOIN STUDENT S ON SC.STUDENT_ID = S.ID
      JOIN PERSON P ON S.ID = P.ID
      LEFT JOIN TUITION T ON SC.PAYMENT_ID = T.PAYMENT_ID
      WHERE SC.COURSE_ID = ?
    `;
    const [students] = await db.execute(query, [courseId]);

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students in course:', error);
=======
// Route to get course information by ID
=======
>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
router.get('/:id', async (req, res) => {
  const courseId = req.params.id;
  try {
      // Lấy thông tin cơ bản của khóa học
      const courseQuery = `
          SELECT * FROM COURSE WHERE COURSE_ID = ?
      `;
      const [courseRows] = await db.execute(courseQuery, [courseId]);

      if (courseRows.length === 0) {
          return res.status(404).json({ error: 'Course not found' });
      }
      const courseInfo = courseRows[0];
      // Lấy danh sách học viên của khóa học
      const studentsQuery = `
          SELECT
              P.ID, P.NAME, P.EMAIL, P.PHONE_NUMBER, P.DATE_OF_BIRTH, S.ENROLL_DATE
          FROM STUDENT_COURSE SC
          JOIN STUDENT S ON SC.STUDENT_ID = S.ID
          JOIN PERSON P ON S.ID = P.ID
          WHERE SC.COURSE_ID = ?
      `;
      const [studentsInCourse] = await db.execute(studentsQuery, [courseId]);
      // Gộp thông tin khóa học và danh sách học viên lại
      const responseData = {
          ...courseInfo,
          STUDENTS: studentsInCourse.map(student => ({
              ID: student.ID,
              NAME: student.NAME,
              EMAIL: student.EMAIL,
              // Thêm các trường khác của học viên nếu cần
          })),
      };
      res.status(200).json(responseData);
  } catch (error) {
      console.error('Error fetching course and students:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get list of students in a course
router.get('/:id/students', async (req, res) => {
  const courseId = req.params.id;

  try {
    const query = `
      SELECT 
        P.ID, P.NAME, P.EMAIL, P.PHONE_NUMBER, P.DATE_OF_BIRTH, S.ENROLL_DATE, T.STATUS AS PAYMENT_STATUS
      FROM STUDENT_COURSE SC
      JOIN STUDENT S ON SC.STUDENT_ID = S.ID
      JOIN PERSON P ON S.ID = P.ID
      LEFT JOIN TUITION T ON SC.PAYMENT_ID = T.PAYMENT_ID
      WHERE SC.COURSE_ID = ?
    `;
    const [students] = await db.execute(query, [courseId]);

    res.status(200).json(students);
  } catch (error) {
<<<<<<< HEAD
    console.error('Error fetching course:', error);
>>>>>>> beebbb895 (update backend)
=======
    console.error('Error fetching students in course:', error);
>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
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
<<<<<<< HEAD
<<<<<<< HEAD
  const { name, description, startDate, endDate, minStu, maxStu, price, teacherName } = req.body;

  if (!name && !description && !startDate && !endDate && !minStu && !maxStu && price === undefined && !teacherName) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  const updatedDescription = teacherName
    ? `[Giáo viên: ${teacherName}] ${description || ''}`
    : description;

=======
  const { name, description, startDate, endDate, minStu, maxStu, price } = req.body;
=======
  const { name, description, startDate, endDate, minStu, maxStu, price, teacherName } = req.body;
>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)

  if (!name && !description && !startDate && !endDate && !minStu && !maxStu && price === undefined && !teacherName) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

<<<<<<< HEAD
>>>>>>> beebbb895 (update backend)
=======
  const updatedDescription = teacherName
    ? `[Giáo viên: ${teacherName}] ${description || ''}`
    : description;

>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
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
<<<<<<< HEAD
<<<<<<< HEAD
      updatedDescription || null,
=======
      description || null,
>>>>>>> beebbb895 (update backend)
=======
      updatedDescription || null,
>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
// Route to remove a student from a course
router.delete('/remove-student', async (req, res) => {
  const { studentId, courseId } = req.body;

  // Validate input
  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const query = `
      DELETE FROM STUDENT_COURSE
      WHERE STUDENT_ID = ? AND COURSE_ID = ?
    `;
    const [result] = await db.execute(query, [studentId, courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found in this course' });
    }

    res.status(200).json({ message: 'Student removed from course successfully' });
  } catch (error) {
    console.error('Error removing student from course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

<<<<<<< HEAD

=======
>>>>>>> beebbb895 (update backend)
=======
// Route to get all courses by student ID
router.get('/student/:studentId', async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const query = `
      SELECT 
        C.COURSE_ID, C.NAME, C.DESCRIPTION, C.START_DATE, C.END_DATE, C.PRICE,
        T.STATUS AS PAYMENT_STATUS
      FROM STUDENT_COURSE SC
      JOIN COURSE C ON SC.COURSE_ID = C.COURSE_ID
      LEFT JOIN TUITION T ON SC.PAYMENT_ID = T.T_ID
      WHERE SC.STUDENT_ID = ?
    `;
    const [courses] = await db.execute(query, [studentId]);

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses by student ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/teacher/:courseId', async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const query = `
      SELECT P.ID, P.NAME, P.EMAIL, P.PHONE_NUMBER, TC.ROLE
      FROM TEACHER_COURSE TC
      JOIN PERSON P ON TC.TEACHER_ID = P.ID
      WHERE TC.COURSE_ID = ?
    `;
    const [teachers] = await db.execute(query, [courseId]);

    res.status(200).json(teachers);
  } catch (error) {
    console.error('Error fetching teachers by course ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

>>>>>>> b5c13c1ed (feat: update course management API and frontend to include teacher information, add category management routes, and enhance course creation with teacher assignment)
module.exports = router;