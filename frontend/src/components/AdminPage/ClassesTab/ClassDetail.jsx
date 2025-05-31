import React, { useState } from 'react';
import './ClassDetail.css';
import formConfigs from '../../../config/formConfig';
import DynamicForm from '../../common/Form/DynamicForm';

const ClassDetail = ({ className, selectedStatus, onBack }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([
    { name: 'Nguyen Van A', email: 'a@example.com' },
    { name: 'Tran Thi B', email: 'b@example.com' },
  ]);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);

  const handleAddStudent = (data) => {
    setStudents([...students, data]);
    setShowAddStudentForm(false);
  };

  return (
    <div className="class-detail-container">
      {/* Nút Back */}
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <h2>{className}</h2>

      {/* Thông tin lớp học */}
      <div className="class-info">
        <p><strong>ID:</strong> </p>
        <p><strong>Name:</strong> </p>
        <p><strong>Description:</strong> </p>
        <p><strong>Teacher:</strong> </p>
        <p><strong>Start Date:</strong> </p>
        <p><strong>End Date:</strong> </p>
      </div>

      {/* Tabs */}
      {selectedStatus === 'Waiting' ? (
        <>
          {showAddStudentForm && (
            <DynamicForm
              formConfig={formConfigs.addStudent}
              onSubmitSuccess={handleAddStudent}
              onClose={() => setShowAddStudentForm(false)}
            />
          )}
        </>
      ) : (
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
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {(activeTab === 'students' || selectedStatus === 'Waiting') && (
          <div>
            <h3>Student List</h3>
            <ul>
              {students.map((s, i) => (
                <li key={i}>
                  {s.name} ({s.email})
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'assignment' && selectedStatus !== 'Waiting' && (
          <div>
            <h3>Assignments</h3>
            <p>No assignments yet.</p>
          </div>
        )}

        {activeTab === 'doc' && selectedStatus !== 'Waiting' && (
          <div>
            <h3>Documents</h3>
            <p>No documents uploaded.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;
