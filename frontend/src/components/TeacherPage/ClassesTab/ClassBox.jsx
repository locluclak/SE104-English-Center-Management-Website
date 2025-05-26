import React from 'react';
import './ClassBox.css';

const ClassBox = ({ name, onClick }) => {
  return (
    <div className="class-box" onClick={() => onClick(name)}>
      {name}
    </div>
  );
};

export default ClassBox;
