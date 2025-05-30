import React from 'react';
import Card from '../../common/Card/Card';
import './ClassList.css';

const ClassList = ({ classList, onSelectClass }) => {
  return (
    <div className="class-grid">
      {classList.map(cls => (
        <Card
          key={cls.id}
          title={cls.name}
          onClick={() => onSelectClass(cls)}
        >
          <p><strong>Teacher:</strong> {cls.teacher}</p>
        </Card>
      ))}
    </div>
  );
};

export default ClassList;
