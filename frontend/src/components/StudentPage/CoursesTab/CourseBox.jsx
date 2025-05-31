import React from 'react';
import './CourseBox.css';

const CourseBox = ({ name, onClick }) => {
  return (
    <div className="class-box" onClick={() => onClick(name)}>
      {name}
    </div>
  );
};

export default CourseBox;
