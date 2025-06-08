import React from 'react';
import Table from '../../../common/Table/Table'; 
import './CourseSection.css';

const CourseSection = ({ title, classList, onClassClick }) => {
  const columns = [
    { header: 'ID', accessor: 'id', },
    { header: 'Class Name', accessor: 'name', },
    {
      header: 'Teacher',
      accessor: 'teacherName',
      render: (row) => row.teacherName || 'Chưa cập nhật',
    },
    { header: 'Start Date', accessor: 'startDateFormatted', },
    { header: 'End Date', accessor: 'endDateFormatted', },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => row.description || "---",
    },
  ];

  return (
    <div className="course-section">
      <h3>{title}</h3>
      {classList.length === 0 ? (
        <p>Không có lớp học nào.</p>
      ) : (
        <Table
          columns={columns}
          data={classList}
          onRowClick={onClassClick} 
        />
      )}
    </div>
  );
};

export default CourseSection;