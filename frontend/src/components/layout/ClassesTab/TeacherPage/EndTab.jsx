import React from 'react';
import CourseSection from "../../Course/CourseSection/CourseSection";

const EndTab = ({ handleClassClick }) => {
  return (
    <>
      <CourseSection
        title="My End Classes"
        classList={['My Class 1', 'My Class 2', 'My Class 3']}
        onClassClick={handleClassClick}
      />
    </>
  );
};

export default EndTab;