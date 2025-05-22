import React from 'react';
import CourseAd from "./CourseAd";
import CourseSection from "./CourseSection";

const HomeTab = ({ handleClassClick }) => {
  return (
    <>
      <CourseAd />
      <CourseSection
        title="Khoá học nghe đọc"
        classList={['Class A', 'Class B']}
        onClassClick={handleClassClick}
      />
      <CourseSection
        title="Khoá học nói viết"
        classList={['Class C', 'Class D']}
        onClassClick={handleClassClick}
      />
    </>
  );
};

export default HomeTab;