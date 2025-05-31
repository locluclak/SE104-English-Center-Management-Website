import React from 'react';
import Card from '../../common/Card/Card'; 
import './CourseSection.css';

const CourseSection = ({ title, classList, onClassClick }) => {
  return (
    <div className="course-section">
      <h3>{title}</h3>
      <div className="course-grid">
        {classList.map((cls) => (
          <Card key={cls} title={cls} onClick={() => onClassClick(cls)} />
        ))}
      </div>
    </div>
  );
};

export default CourseSection;