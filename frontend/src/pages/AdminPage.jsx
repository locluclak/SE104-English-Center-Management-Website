import React, { useState } from 'react';
import './AdminPage.css'; // Thêm file CSS để style

const AdminPage = () => {
  // State để quản lý tab đang hoạt động
  const [activeTab, setActiveTab] = useState('classes');

  // Dữ liệu mẫu cho các báo cáo hoặc các phần khác nếu cần
  const reportData = [
    { id: 1, title: 'Class Management', description: 'Manage all the classes and schedules.' },
    { id: 2, title: 'Staff Management', description: 'View and manage all staff members.' },
    { id: 3, title: 'Notifications', description: 'Send notifications to students or staff.' },
    { id: 4, title: 'Point Report', description: 'View and manage point reports for students.' },
    // Thêm dữ liệu nếu cần
  ];

  return (
    <div>
      {/* Thanh điều hướng phía trên */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo căn lề trái */}
          <div className="logo">Pro-Skills Admin</div>

          {/* Các tab căn lề phải */}
          <ul className="navbar-menu">
            <li
              onClick={() => setActiveTab('classes')}
              className={activeTab === 'classes' ? 'active' : ''}
            >
              Classes
            </li>
            <li
              onClick={() => setActiveTab('staff')}
              className={activeTab === 'staff' ? 'active' : ''}
            >
              Staff
            </li>
            <li
              onClick={() => setActiveTab('notification')}
              className={activeTab === 'notification' ? 'active' : ''}
            >
              Notification
            </li>
            <li
              onClick={() => setActiveTab('pointReport')}
              className={activeTab === 'pointReport' ? 'active' : ''}
            >
              Point Report
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
          <div className="report-section">
            <h2>Class Management</h2>
            <ul>
              {reportData.map((report) => (
                <li key={report.id}>
                  <h3>{report.title}</h3>
                  <p>{report.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'staff' && <div>Staff Management Content</div>}
        {activeTab === 'notification' && <div>Notification Management Content</div>}
        {activeTab === 'pointReport' && <div>Point Report Content</div>}
        {activeTab === 'account' && <div>Account Management Content</div>}
      </div>
    </div>
  );
};

export default AdminPage;