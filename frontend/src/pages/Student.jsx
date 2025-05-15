import React, { useState } from 'react';
import './Student.css';
import { FaHome, FaBell, FaSearch, FaUserCircle, FaPlus } from 'react-icons/fa';
import { HiOutlineCalendar } from 'react-icons/hi';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [courses, setCourses] = useState([
    
  ]);

  // Khởi tạo state cho ngày tháng
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateRange = (start, end) => {
    const startOptions = { month: 'long', day: 'numeric' };
    const endOptions = { day: 'numeric' };
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', startOptions)} to ${endDate.toLocaleDateString('en-US', endOptions)}`;
  };

  const nextThreeDaysStart = new Date();
  nextThreeDaysStart.setDate(today.getDate() + 2);
  const nextThreeDaysEnd = new Date();
  nextThreeDaysEnd.setDate(today.getDate() + 4);

  const may2025 = new Date(2025, 4, 20); // Tháng 4 là index 4 (0-based)

  return (
    <div className="student-page">
      {/* Header */}
      <header className="student-header">
        <div className="header-left">
          <h1 className="logo">EngToeic-Center</h1>
        </div>
        <div className="header-center">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
        </div>
        <div className="header-right">
          <div className="notification-icon">
            <FaBell />
            {/* Bạn có thể thêm badge thông báo nếu cần */}
          </div>
          <div className="account-icon">
            <FaUserCircle />
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="main-nav">
        <ul>
          <li
            onClick={() => setActiveTab('home')}
            className={activeTab === 'home' ? 'active' : ''}
          >
            <FaHome className="nav-icon" />
            <span></span>
          </li>
          <li
            onClick={() => setActiveTab('classes')}
            className={activeTab === 'classes' ? 'active' : ''}
          >
            <span>Classes</span>
          </li>
          <li
            onClick={() => setActiveTab('dashboard')}
            className={activeTab === 'dashboard' ? 'active' : ''}
          >
            <span>Dashboard</span>
          </li>
        </ul>
      </nav>

      {/* Content */}
      <div className="content">
        {activeTab === 'home' && (
          <div className="home-content">
            {/* Nội dung trang chủ có thể để trống hoặc thêm các thành phần khác */}
          </div>
        )}

        {activeTab === 'classes' && <div>My Courses Content</div>}
        {activeTab === 'dashboard' && <div>Assignment</div>}
        {activeTab === 'notification' && <div>Notification Content</div>}
        {activeTab === 'account' && <div>Account Content</div>}
      </div>
    </div>
  );
};

export default StudentPage;