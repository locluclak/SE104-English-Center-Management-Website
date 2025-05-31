import React from 'react';
import CourseSection from "./CourseSection";

const MyCoursesTab = ({ handleClassClick }) => {
  return (
    <>
      <CourseSection
        title="Khoá học của tôi"
        classList={['My Class 1', 'My Class 2', 'My Class 3']}
        onClassClick={handleClassClick}
      />
    </>
  );
};

export default MyCoursesTab;