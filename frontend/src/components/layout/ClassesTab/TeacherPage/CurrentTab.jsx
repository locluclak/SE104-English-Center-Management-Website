import React, { useState, useEffect } from 'react';
import CourseSection from "../../Course/CourseSection/CourseSection";
import { getCoursesByTeacherId } from "../../../../services/courseService";

const CurrentTab = ({ handleClassClick, teacherId }) => {
  const [currentCourses, setCurrentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!teacherId) {
        setLoading(false);
        console.warn("Teacher ID is not provided for MyCoursesTab.");
        return;
      }

      try {
        const teacherCourses = await getCoursesByTeacherId(teacherId);
        
        const formattedCourses = teacherCourses.map(course => ({
          id: course.COURSE_ID,
          name: course.NAME,
          description: course.DESCRIPTION,
          price: course.PRICE,
          startDateFormatted: new Date(course.START_DATE).toLocaleDateString(),
          endDateFormatted: new Date(course.END_DATE).toLocaleDateString(),
        }));
        
        setCurrentCourses(formattedCourses);
        console.log("API returned courses:", teacherCourses);
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
    <CourseSection
      title="Lớp học của tôi" 
      classList={currentCourses}
      onClassClick={(course) => handleClassClick(course.id)}
    />
  );
};

export default CurrentTab;