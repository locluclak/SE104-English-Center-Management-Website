import React from 'react';
import './CourseDetail.css';

const CourseDetail = ({ className, onBack }) => {
  // Dữ liệu mẫu – có thể thay bằng props hoặc fetch từ backend
  const info = {
    id: 'ENG123',
    name: className,
    description: 'Khóa học nâng cao kỹ năng giao tiếp và phản xạ.',
    teacher: 'Nguyễn Văn A',
    startDate: '01/06/2025',
    endDate: '30/08/2025',
    schedule: 'Thứ 2, 4, 6 - 18:00 đến 20:00',
  };

  return (
    <div className="course-detail">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <h2>Thông tin lớp: {className}</h2>
      <div className="course-info">
        <p><strong>ID:</strong> {info.id}</p>
        <p><strong>Mô tả:</strong> {info.description}</p>
        <p><strong>Giáo viên:</strong> {info.teacher}</p>
        <p><strong>Thời gian học:</strong> {info.schedule}</p>
        <p><strong>Ngày bắt đầu:</strong> {info.startDate}</p>
        <p><strong>Ngày kết thúc:</strong> {info.endDate}</p>
      </div>
    </div>
  );
};

export default CourseDetail;
