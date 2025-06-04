import React, { useState } from 'react';
import './ClassDetail.css';
import Table from '../../common/Table/Table';

import {
  getStudentTableColumns,
  assignmentTableColumns,
  documentTableColumns
} from "../../../config/tableConfig.jsx";

const ClassDetail = ({ className, onBack }) => {
  const [activeTab, setActiveTab] = useState('students');

  const info = {
    id: 'ENG123',
    name: className,
    numberStudents: '30',
    startDate: '01/06/2025',
    endDate: '30/08/2025',
  };

  // Dữ liệu mẫu
  const studentData = [
    { id: 'S001', name: 'Nguyễn Văn A', birthday: '01/01/2000', email: 'a@gmail.com' },
    { id: 'S002', name: 'Trần Thị B', birthday: '02/02/2001', email: 'b@gmail.com' },
  ];

  const assignmentData = [
    { id: 'A001', title: 'Bài tập 1', description: 'Ngữ pháp', assignedDate: '02/06/2025' },
    { id: 'A002', title: 'Bài tập 2', description: 'Từ vựng', assignedDate: '04/06/2025' },
  ];

  const documentData = [
    { id: 'D001', name: 'Tài liệu 1', description: 'Lý thuyết', uploadDate: '01/06/2025' },
    { id: 'D002', name: 'Tài liệu 2', description: 'Bài tập thực hành', uploadDate: '03/06/2025' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <Table
            columns={getStudentTableColumns().filter(col => col.accessor !== 'status' && col.header !== 'Action')}
            data={studentData}
          />
        );
      case 'assignment':
        return <Table columns={assignmentTableColumns} data={assignmentData} />;
      case 'doc':
        return <Table columns={documentTableColumns} data={documentData} />;
      default:
        return null;
    }
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
          <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
            Students
          </button>
          <button className={activeTab === 'assignment' ? 'active' : ''} onClick={() => setActiveTab('assignment')}>
            Assignment
          </button>
          <button className={activeTab === 'doc' ? 'active' : ''} onClick={() => setActiveTab('doc')}>
            Doc
          </button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;
