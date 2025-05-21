import React from 'react';
import CourseBox from './CourseBox';
import './CourseSection.css';

const CourseSection = ({ title, classList, onClassClick }) => {
  return (
    <div className="course-section">
      <h3>{title}</h3>
      <div className="course-grid">
        {classList.map((cls) => (
          <CourseBox key={cls} name={cls} onClick={onClassClick} />
        ))}
      </div>
    </div>
  );
};

export default CourseSection;
