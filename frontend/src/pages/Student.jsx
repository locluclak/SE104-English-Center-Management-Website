import React, { useState } from 'react';
import './Student.css'; // Thêm file CSS để style

const StudentPage = () => {
  // State để quản lý tab đang hoạt động
  const [activeTab, setActiveTab] = useState('classes');

  // Dữ liệu mẫu về các khóa học
  const courses = [
    { id: 1, name: 'Speaking - Writing 400', description: 'Learn the basics of web development.' },
    { id: 2, name: 'Listening - Reading 500', description: 'Dive into data analysis and machine learning.' },
    
    // Thêm các khóa học khác vào đây
  ];

  return (
    <div>
      {/* Thanh điều hướng phía trên */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">EngToiec-Center</div>
          <ul className="navbar-menu">
            <li
              onClick={() => setActiveTab('classes')}
              className={activeTab === 'classes' ? 'active' : ''}
            >
              Classes
            </li>
            <li
              onClick={() => setActiveTab('dashboard')}
              className={activeTab === 'dashboard' ? 'active' : ''}
            >
              Dashboard
            </li>
            <li
              onClick={() => setActiveTab('notification')}
              className={activeTab === 'notification' ? 'active' : ''}
            >
              Notification
            </li>
            <li
              onClick={() => setActiveTab('account')}
              className={activeTab === 'account' ? 'active' : ''}
            >
              Account
            </li>
          </ul>
        </div>
      </nav>

      {/* Phần nội dung của trang */}
      <div className="content">
        {activeTab === 'classes' && (
          <div className="courses-list">
            <h2>Courses Available</h2>
            <ul>
              {courses.map((course) => (
                <li key={course.id}>
                  <h3>{course.name}</h3>
                  <p>{course.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'dashboard' && <div>Dashboard Content</div>}
        {activeTab === 'notification' && <div>Notification Content</div>}
        {activeTab === 'account' && <div>Account Content</div>}
      </div>
    </div>
  );
};

export default StudentPage;