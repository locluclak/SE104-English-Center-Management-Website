import React, { useState } from 'react';
import { FaHome, FaBell, FaSearch, FaUserCircle, FaPlus } from 'react-icons/fa';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleAddClassClick = () => {
    console.log('Add New Class clicked');
    // Thêm logic xử lý việc thêm lớp học ở đây (ví dụ: hiển thị form)
  };

  const handleStaffManagementClick = (staffType) => {
    setActiveTab(staffType); // Cập nhật activeTab dựa trên loại nhân viên được chọn
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
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
            <span>Class Management</span>
          </li>
          <li
            onClick={() => setActiveTab('staff')}
            className={activeTab === 'staff' ? 'active' : ''}
          >
            <span>Staff Management</span>
          </li>
          <li
            onClick={() => setActiveTab('pointReport')}
            className={activeTab === 'pointReport' ? 'active' : ''}
          >
            <span>Point Report</span>
          </li>
        </ul>
      </nav>

      {/* Content */}
      <div className="content">
        {activeTab === 'home' && (
          <div className="dashboard">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Students</h3>
                <p></p>
              </div>
              <div className="stat-card">
                <h3>Active Classes</h3>
                <p></p>
              </div>
              <div className="stat-card">
                <h3>Monthly Revenue</h3>
                <p></p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="class-management-page">
            <h2>Class Management</h2>
            <button className="add-class-button" onClick={handleAddClassClick}>
              <FaPlus className="add-icon" /> Add Class
            </button>
            {/* Phần hiển thị danh sách lớp học hoặc các chức năng quản lý lớp học khác có thể thêm ở đây */}
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="staff-management-page">
            <h2>Staff Management</h2>
            <div className="staff-options">
              <button onClick={() => handleStaffManagementClick('admins')}>Admin</button>
              <button onClick={() => handleStaffManagementClick('teachers')}>Teacher</button>
              <button onClick={() => handleStaffManagementClick('accountants')}>Accountant</button>
            </div>
            {/* Nội dung chung của Staff Management có thể hiển thị ở đây nếu cần */}
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="admin-page">
            <h2>Admin Management</h2>
            {/* Nội dung quản lý Admin */}
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="teacher-page">
            <h2>Teacher Management</h2>
            {/* Nội dung quản lý Giáo viên */}
          </div>
        )}

        {activeTab === 'accountants' && (
          <div className="accountant-page">
            <h2>Accountant Management</h2>
            {/* Nội dung quản lý Kế toán */}
          </div>
        )}

        {activeTab === 'pointReport' && (
          <div className="point-report-page">
            <h2>Point Report</h2>
            {/* Nội dung báo cáo điểm */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;