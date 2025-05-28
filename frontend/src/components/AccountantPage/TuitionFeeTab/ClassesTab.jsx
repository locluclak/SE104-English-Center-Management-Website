import React, { useState } from 'react';
import './ClassesTab.css';

const mockClasses = [
  {
    id: 'C001',
    name: 'Lớp Tiếng Anh A1',
    description: 'Lớp dành cho người mới bắt đầu',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    students: [
      { id: 'S001', name: 'Nguyen Van A', fee: '2,000,000', paymentStatus: 'Paid' },
      { id: 'S002', name: 'Tran Thi B', fee: '2,000,000', paymentStatus: 'Unpaid' },
    ],
  },
  {
    id: 'C002',
    name: 'Lớp Tiếng Anh B1',
    description: 'Lớp trung cấp',
    startDate: '2025-06-15',
    endDate: '2025-09-15',
    students: [
      { id: 'S003', name: 'Le Van C', fee: '2,500,000', paymentStatus: 'Transfer' },
      { id: 'S004', name: 'Pham Thi D', fee: '2,500,000', paymentStatus: 'Paid' },
    ],
  },
];

const ClassesTab = () => {
  const [selectedClass, setSelectedClass] = useState(null);

  const handleCardClick = (cls) => {
    setSelectedClass(cls);
  };

  const handleBack = () => {
    setSelectedClass(null);
  };

  return (
    <div className="classes-tab">
      {!selectedClass && (
        <>
          <h2>Danh sách các lớp học</h2>
          <div className="class-cards-container">
            {mockClasses.map((cls) => (
              <div
                key={cls.id}
                className="class-card"
                onClick={() => handleCardClick(cls)}
              >
                <h3>{cls.name}</h3>
                <p>{cls.description}</p>
                <p><strong>Thời gian:</strong> {cls.startDate} - {cls.endDate}</p>
                <p><strong>Số học viên:</strong> {cls.students.length}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedClass && (
        <div className="class-detail-fullscreen">
          <button className="back-button" onClick={handleBack}>← Back</button>
          <h3>Thông tin lớp: {selectedClass.name}</h3>
          <p>Mô tả: {selectedClass.description}</p>
          <p>Thời gian: {selectedClass.startDate} đến {selectedClass.endDate}</p>

          <h4>Danh sách học viên</h4>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên học viên</th>
                <th>Học phí</th>
                <th>Trạng thái đóng học phí</th>
              </tr>
            </thead>
            <tbody>
              {selectedClass.students.map((stu) => (
                <tr key={stu.id}>
                  <td>{stu.id}</td>
                  <td>{stu.name}</td>
                  <td>{stu.fee}</td>
                  <td>{stu.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClassesTab;
