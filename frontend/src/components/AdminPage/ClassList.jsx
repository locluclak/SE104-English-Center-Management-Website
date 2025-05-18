import React from 'react';
import './ClassList.css';

const ClassList = ({ classList, onSelectClass }) => {
  return (
    <div className="class-grid">
      {classList.map(cls => (
        <div className="class-card" key={cls.id} onClick={() => onSelectClass(cls)}>
          <h3>{cls.name}</h3>
          <p><strong>Teacher:</strong> {cls.teacher}</p>
        </div>
      ))}
    </div>
  );
};

export default ClassList;
