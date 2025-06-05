import React, { useState, useEffect } from 'react';
import CourseSection from "../../Course/CourseSection/CourseSection";
import { getCoursesByStudentId } from '../../../../services/courseService'; 

const WaitingTab = ({ studentId, onClassClick }) => { 
  const [waitingCourses, setWaitingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterWaitingCourses = async () => {
      if (!studentId) {
        setLoading(false);
        console.warn("Student ID is not provided for WaitingTab.");
        return;
      }

      try {
        const studentCourses = await getCoursesByStudentId(studentId);
        const now = new Date();
        const waiting = [];

        studentCourses.forEach(course => {
          const courseStartDate = new Date(course.START_DATE);

          if (courseStartDate > now) {
            const formattedCourse = {
              id: course.COURSE_ID,
              name: course.NAME,
              description: course.DESCRIPTION,
              price: course.PRICE,
              teacherName: 'Chưa cập nhật',
              status: course.PAYMENT_STATUS,
              startDateFormatted: new Date(course.START_DATE).toLocaleDateString('vi-VN'),
              endDateFormatted: new Date(course.END_DATE).toLocaleDateString('vi-VN'),
              startDate: courseStartDate, 
            };
            waiting.push(formattedCourse);
          }
        });

        waiting.sort((a, b) => a.startDate - b.startDate);
        setWaitingCourses(waiting);
      } catch (error) {
        console.error('Error loading waiting courses for student:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterWaitingCourses();
  }, [studentId]);

  if (loading) return <p>Đang tải dữ liệu lớp học đang chờ...</p>;
  if (!waitingCourses || waitingCourses.length === 0) {
    return <p>Không có lớp học nào đang chờ.</p>;
  }

  return (
    <>
      <CourseSection
        title="Lớp học sắp bắt đầu"
        classList={waitingCourses}
        onClassClick={(course) => onClassClick(course.id)} // Truyền ID khi click
      />
    </>
  );
};

export default WaitingTab;