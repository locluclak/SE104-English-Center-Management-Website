import React, { useState } from 'react';
import './ClassDetail.css';

const ClassDetail = ({ className, onBack }) => {
  const [activeTab, setActiveTab] = useState('students');  

  const info = {
    id: 'ENG123',
    name: className,
    numberStudents: '30',
    startDate: '01/06/2025',
    endDate: '30/08/2025',
  };

  return (
    <div className="class-detail-container">
      <div className="class-detail-main">
        <button className="back-btn" onClick={onBack}>← Back</button>
        
        <h2>Thông tin lớp: {className}</h2>
        
        <div className="classes-info">
          <p><strong>ID:</strong> {info.id}</p>
          <p><strong>Number of students:</strong> {info.numberStudents}</p>
          <p><strong>Start date:</strong> {info.startDate}</p>
          <p><strong>End date:</strong> {info.endDate}</p>
        </div>

        <div className="tabs">
          <button
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={activeTab === 'assignment' ? 'active' : ''}
            onClick={() => setActiveTab('assignment')}
          >
            Assignment
          </button>
          <button
            className={activeTab === 'doc' ? 'active' : ''}
            onClick={() => setActiveTab('doc')}
          >
            Doc
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;