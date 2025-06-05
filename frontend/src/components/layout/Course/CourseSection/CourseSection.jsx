import React from 'react';
import Card from '../../../common/Card/Card'; 
import './CourseSection.css';

const CourseSection = ({ title, classList, onClassClick }) => {
  return (
    <div className="course-section">
      <h3>{title}</h3>
      {classList.length === 0 ? (
        <p>Không có lớp học nào.</p>
      ) : (
        <div className="course-grid">
          {classList.map((course) => (
            <Card
              key={course.id}
              title={course.name}
              onClick={() => onClassClick(course)}
            >
              <p><strong>ID:</strong> {course.id}</p>
              <p><strong>Giáo viên:</strong> {course.teacherName || 'Chưa cập nhật'}</p>
              <p><strong>Trạng thái:</strong> {course.status}</p>
              <p><strong>Ngày bắt đầu:</strong> {course.startDateFormatted}</p>
              <p><strong>Ngày kết thúc:</strong> {course.endDateFormatted}</p>
              <p><strong>Mô tả:</strong> {course.description || "Không có"}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseSection;