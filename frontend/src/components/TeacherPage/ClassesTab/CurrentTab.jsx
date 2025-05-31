import React from 'react';
import ClassSection from "./ClassSection";

const CurrentTab = ({ handleClassClick }) => {
  return (
    <>
      <ClassSection
        title="My Current Classes"
        classList={['My Class 1', 'My Class 2', 'My Class 3']}
        onClassClick={handleClassClick}
      />
    </>
  );
};

export default CurrentTab;