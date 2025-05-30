import React from 'react';
import CourseSection from "./ClassSection";

const CurrentTab = ({ handleClassClick }) => {
  return (
    <>
      <CourseSection
        title="My Current Classes"
        classList={['My Class 1', 'My Class 2', 'My Class 3']}
        onClassClick={handleClassClick}
      />
    </>
  );
};

export default CurrentTab;