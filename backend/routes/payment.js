const express = require('express');
const router = express.Router();
const db = require('../db');
const { Parser } = require('json2csv'); // Import json2csv library
const fs = require('fs'); // File system module

// Update tuition information by T_ID
router.put('/tuition/:id', async (req, res) => {
  const tuitionId = req.params.id;
  const { PRICE, TYPE, DESCRIPTION, STATUS, PAID_DATE } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE TUITION SET PRICE = ?, TYPE = ?, DESCRIPTION = ?, STATUS = ?, PAID_DATE = ? WHERE T_ID = ?`,
      [PRICE, TYPE, DESCRIPTION, STATUS, PAID_DATE, tuitionId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tuition not found' });
    }
    res.json({ message: 'Tuition updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

// Get revenue report for a course
router.get('/revenue-report/:courseId', async (req, res) => {
  const courseId = req.params.courseId;

  try {
    // Query to fetch students and their payment info for the given course
    const [students] = await db.query(
      `SELECT 
        PERSON.NAME AS student_name,
        PERSON.EMAIL AS student_email,
        TUITION.PRICE AS payment_price,
        TUITION.TYPE AS payment_type,
        TUITION.STATUS AS payment_status,
        TUITION.PAID_DATE AS payment_date
      FROM STUDENT_COURSE
      JOIN STUDENT ON STUDENT_COURSE.STUDENT_ID = STUDENT.ID
      JOIN PERSON ON STUDENT.ID = PERSON.ID
      JOIN TUITION ON STUDENT_COURSE.PAYMENT_ID = TUITION.T_ID
      WHERE STUDENT_COURSE.COURSE_ID = ?`,
      [courseId]
    );

    // Calculate total revenue
    const totalRevenue = students.reduce((sum, student) => {
      return student.payment_status === 'PAID' ? sum + parseFloat(student.payment_price) : sum;
    }, 0);

    res.json({
      courseId,
      totalRevenue,
      students,
    });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

// Export revenue report for a course to CSV
router.get('/revenue-report/:courseId/export', async (req, res) => {
  const courseId = req.params.courseId;

  try {
    // Query to fetch course details and students' payment info
    const [courseDetails] = await db.query(
      `SELECT 
        COURSE.NAME AS course_name,
        COURSE.DESCRIPTION AS course_description,
        COURSE.START_DATE AS course_start_date,
        COURSE.END_DATE AS course_end_date,
        COURSE.NUMBER_STU AS number_of_students
      FROM COURSE
      WHERE COURSE.COURSE_ID = ?`,
      [courseId]
    );

    if (courseDetails.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [students] = await db.query(
      `SELECT 
        PERSON.NAME AS student_name,
        PERSON.EMAIL AS student_email,
        TUITION.PRICE AS payment_price,
        TUITION.TYPE AS payment_type,
        TUITION.STATUS AS payment_status,
        TUITION.PAID_DATE AS payment_date
      FROM STUDENT_COURSE
      JOIN STUDENT ON STUDENT_COURSE.STUDENT_ID = STUDENT.ID
      JOIN PERSON ON STUDENT.ID = PERSON.ID
      JOIN TUITION ON STUDENT_COURSE.PAYMENT_ID = TUITION.T_ID
      WHERE STUDENT_COURSE.COURSE_ID = ?`,
      [courseId]
    );

    const totalRevenue = students.reduce((sum, student) => {
      return student.payment_status === 'PAID' ? sum + parseFloat(student.payment_price) : sum;
    }, 0);

    const fields = ['student_name', 'student_email', 'payment_price', 'payment_type', 'payment_status', 'payment_date'];
    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(students);

    // Append course details and total revenue to the CSV
    csv = `Course Name: ${courseDetails[0].course_name}\nCourse Description: ${courseDetails[0].course_description}\nStart Date: ${courseDetails[0].course_start_date}\nEnd Date: ${courseDetails[0].course_end_date}\nNumber of Students: ${courseDetails[0].number_of_students}\n\n` + csv;
    csv += `\n\nTotal Revenue,,${totalRevenue}`;

    // Send CSV as file
    res.setHeader('Content-Disposition', `attachment; filename=revenue-report-course-${courseId}.csv`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);

  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

// Get revenue report for a specified time range, grouped by courses or students
router.get('/revenue-report-bytime', async (req, res) => {
  const { startTime, endTime, groupBy } = req.query; // Expect startTime, endTime, and optional groupBy query parameters

  if (!startTime || !endTime) {
    return res.status(400).json({ message: 'Please provide both startTime and endTime query parameters.' });
  }

  let groupQuery = '';
  if (groupBy === 'courses') {
    groupQuery = `COURSE.COURSE_ID AS course_id, COURSE.NAME AS course_name, SUM(TUITION.PRICE) AS total_revenue`;
  } else if (groupBy === 'students') {
    groupQuery = `PERSON.ID AS student_id, PERSON.NAME AS student_name, PERSON.EMAIL AS student_email, SUM(TUITION.PRICE) AS total_paid`;
  } else {
    return res.status(400).json({ message: 'Invalid groupBy parameter. Use "courses" or "students".' });
  }

  try {
    // Query to fetch payments within the specified time range, grouped by the specified parameter
    const [report] = await db.query(
      `SELECT 
        ${groupQuery}
      FROM STUDENT_COURSE
      JOIN STUDENT ON STUDENT_COURSE.STUDENT_ID = STUDENT.ID
      JOIN PERSON ON STUDENT.ID = PERSON.ID
      JOIN TUITION ON STUDENT_COURSE.PAYMENT_ID = TUITION.T_ID
      JOIN COURSE ON STUDENT_COURSE.COURSE_ID = COURSE.COURSE_ID
      WHERE TUITION.STATUS = 'PAID' AND TUITION.PAID_DATE BETWEEN ? AND ?
      GROUP BY ${groupBy === 'courses' ? 'COURSE.COURSE_ID' : 'PERSON.ID'}`,
      [startTime, endTime]
    );

    // Query to calculate overall revenue within the specified time range
    const [totalRevenueResult] = await db.query(
      `SELECT SUM(TUITION.PRICE) AS overall_revenue
      FROM TUITION
      WHERE TUITION.STATUS = 'PAID' AND TUITION.PAID_DATE BETWEEN ? AND ?`,
      [startTime, endTime]
    );

    const overallRevenue = totalRevenueResult[0]?.overall_revenue || 0;

    res.json({
      startTime,
      endTime,
      groupBy,
      overallRevenue,
      report,
    });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

// Export revenue report for a specified time range to CSV
router.get('/revenue-report-bytime/export', async (req, res) => {
  const { startTime, endTime, groupBy } = req.query; // Expect startTime, endTime, and optional groupBy query parameters

  if (!startTime || !endTime) {
    return res.status(400).json({ message: 'Please provide both startTime and endTime query parameters.' });
  }

  let groupQuery = '';
  if (groupBy === 'courses') {
    groupQuery = `COURSE.COURSE_ID AS course_id, COURSE.NAME AS course_name, SUM(TUITION.PRICE) AS total_revenue`;
  } else if (groupBy === 'students') {
    groupQuery = `PERSON.ID AS student_id, PERSON.NAME AS student_name, PERSON.EMAIL AS student_email, SUM(TUITION.PRICE) AS total_paid`;
  } else {
    return res.status(400).json({ message: 'Invalid groupBy parameter. Use "courses" or "students".' });
  }

  try {
    // Query to fetch payments within the specified time range, grouped by the specified parameter
    const [report] = await db.query(
      `SELECT 
        ${groupQuery}
      FROM STUDENT_COURSE
      JOIN STUDENT ON STUDENT_COURSE.STUDENT_ID = STUDENT.ID
      JOIN PERSON ON STUDENT.ID = PERSON.ID
      JOIN TUITION ON STUDENT_COURSE.PAYMENT_ID = TUITION.T_ID
      JOIN COURSE ON STUDENT_COURSE.COURSE_ID = COURSE.COURSE_ID
      WHERE TUITION.STATUS = 'PAID' AND TUITION.PAID_DATE BETWEEN ? AND ?
      GROUP BY ${groupBy === 'courses' ? 'COURSE.COURSE_ID' : 'PERSON.ID'}`,
      [startTime, endTime]
    );

    // Query to calculate overall revenue within the specified time range
    const [totalRevenueResult] = await db.query(
      `SELECT SUM(TUITION.PRICE) AS overall_revenue
      FROM TUITION
      WHERE TUITION.STATUS = 'PAID' AND TUITION.PAID_DATE BETWEEN ? AND ?`,
      [startTime, endTime]
    );

    const overallRevenue = totalRevenueResult[0]?.overall_revenue || 0;

    // Prepare data for CSV
    const fields = groupBy === 'courses'
      ? ['course_id', 'course_name', 'total_revenue']
      : ['student_id', 'student_name', 'student_email', 'total_paid'];
    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(report);

    // Append overall revenue to the CSV
    csv += `\n\nOverall Revenue,,${overallRevenue}`;

    // Send CSV as file
    res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${groupBy}-${startTime}-to-${endTime}.csv`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

module.exports = router;