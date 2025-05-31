import React, { useState } from 'react';
import './CourseDetail.css';

const CourseDetail = ({ className, onBack }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const info = {
    id: 'ENG123',
    name: className,
    description: 'Khóa học nâng cao kỹ năng giao tiếp và phản xạ.',
    teacher: 'Nguyễn Văn A',
    startDate: '01/06/2025',
    endDate: '30/08/2025',
    numberStudents: '30',
    tuition: '2.000.000 VNĐ',
  };

  const handleRegister = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    alert('Đăng ký thành công!');
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="course-detail-container">
      <div className="course-detail-main">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Thông tin lớp: {className}</h2>
        <div className="course-info">
          <p><strong>ID:</strong> {info.id}</p>
          <p><strong>Description:</strong> {info.description}</p>
          <p><strong>Teacher:</strong> {info.teacher}</p>
          <p><strong>Number of students:</strong> {info.numberStudents}</p>
          <p><strong>Start date:</strong> {info.startDate}</p>
          <p><strong>End date:</strong> {info.endDate}</p>
          <p><strong>Tuition:</strong> {info.tuition}</p>
          <div className="register-btn-wrapper">
            <button className="register-btn" onClick={handleRegister}>Register</button>
          </div>
        </div>
        {showConfirm && (
          <div className="confirm-modal">
            <div className="confirm-box">
              <p>Are you sure you want to register for this class?</p>
              <div className="modal-buttons">
                <button onClick={handleConfirm}>Confirm</button>
                <button onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;