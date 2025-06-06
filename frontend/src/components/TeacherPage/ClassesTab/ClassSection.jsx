import React from 'react';
import ClassBox from './ClassBox';
import './ClassSection.css';

const ClassSection = ({ title, classList, onClassClick }) => {
  return (
    <div className="class-section">
      <h3>{title}</h3>
      <div className="class-grid">
        {classList.map((cls) => (
          <ClassBox key={cls} name={cls} onClick={onClassClick} />
        ))}
      </div>
    </div>
  );
};

export default ClassSection;
