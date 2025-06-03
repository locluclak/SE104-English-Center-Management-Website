// components/StudentPage/CoursesTab/CourseProgress.jsx
import React from 'react';
import './CourseProgress.css';

const CourseProgress = ({ className }) => {
  // Dữ liệu mẫu về tiến trình khóa học
  const courseStages = [
    { month: 'THÁNG 10', stages: ['Khởi động', 'Từ vựng'] },
    { month: 'THÁNG 11', stages: ['Part 1', 'Part 2'] },
    { month: 'THÁNG 12', stages: ['Ôn tập', 'Thi cuối kỳ'] },
  ];

  return (
    <div className="course-progress">
      <h3>Tiến trình khóa học: {className}</h3>
      <div className="progress-container">
        {courseStages.map((stage, index) => (
          <div key={index} className="month-section">
            <div className="month-header">{stage.month}</div>
            <div className="stages-list">
              {stage.stages.map((item, idx) => (
                <div key={idx} className="stage-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseProgress;