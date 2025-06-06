import React, { useState, useEffect } from 'react';
import CourseSection from "../../Course/CourseSection/CourseSection";
import { getCoursesByTeacherId } from "../../../../services/courseService";

const EndTab = ({ teacherId, handleClassClick }) => { 
  const [endedCourses, setEndedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!teacherId) {
        setLoading(false);
        console.warn("Teacher ID is not provided for EndTab.");
        return;
      }

      try {
        const teacherCourses = await getCoursesByTeacherId(teacherId);
        const now = new Date(); // Define 'now' here

        const allFormattedCourses = teacherCourses.map(course => ({
          id: course.COURSE_ID,
          name: course.NAME,
          description: course.DESCRIPTION,
          price: course.PRICE,
          startDateFormatted: new Date(course.START_DATE).toLocaleDateString(),
          endDateFormatted: new Date(course.END_DATE).toLocaleDateString(),
          startDate: new Date(course.START_DATE),
          endDate: new Date(course.END_DATE),
        }));

        const filteredEndedCourses = allFormattedCourses.filter(course => {
          return course.endDate < now;
        });

        setEndedCourses(filteredEndedCourses);
      } catch (error) {
        console.error('Error loading courses for teacher:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [teacherId]); 

  if (loading) return <p>Đang tải dữ liệu lớp học...</p>;

  return (
    <>
      <CourseSection
        title="Lớp học đã kết thúc"
        classList={endedCourses}
        onClassClick={(courseId) => handleClassClick(courseId)} 
      />
    </>
  );
};

export default EndTab;