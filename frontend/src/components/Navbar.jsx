import React, { useState } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import NotificationPopup from './NotificationPopup';
import AccountPopup from './AccountPopup';  // import popup tài khoản
import './Navbar.css';

const getLinksByRole = (role) => {
  switch (role) {
    case 'admin':
      return [
        { key: 'classes', name: 'Classes' },
        { key: 'students', name: 'Students' },
        { key: 'staffs', name: 'Staffs' },
      ];
    case 'student':
      return [
        { key: 'courses', name: 'Courses' },
        { key: 'notes', name: 'Notes' },
      ];
    case 'teacher':
      return [
        { key: 'classes', name: 'Classes' },
        { key: 'students', name: 'Students' },
      ];
    default:
      return [];
  }
};

const Navbar = ({ role, activeTab, setActiveTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);

  const notifications = [
    { id: 1, message: "Bạn có đơn đăng ký mới." },
    { id: 2, message: "Lịch học hôm nay có thay đổi." },
    { id: 3, message: "Phiên bản mới đã được cập nhật." },
  ];

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>EngToeic-Center</h1>
        </div>

        <div className="navbar-right">
          <ul className="navbar-center">
            {getLinksByRole(role).map((link) => (
              <li
                key={link.key}
                onClick={() => setActiveTab(link.key)}
                className={activeTab === link.key ? 'active' : ''}
              >
                <span>{link.name}</span>
              </li>
            ))}
          </ul>

          <div className="notification-wrapper" style={{ position: 'relative' }}>
            <FaBell
              className="icon"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (showAccountPopup) setShowAccountPopup(false); // đóng popup account nếu đang mở
              }}
              title="Thông báo"
              style={{ cursor: 'pointer' }}
            />
            <NotificationPopup
              notifications={notifications}
              visible={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          <div className="account-wrapper" style={{ position: 'relative', marginLeft: 15 }}>
            <FaUserCircle
              className="icon"
              onClick={() => {
                setShowAccountPopup(!showAccountPopup);
                if (showNotifications) setShowNotifications(false); // đóng popup thông báo nếu đang mở
              }}
              title="Tài khoản"
              style={{ cursor: 'pointer' }}
            />
            <AccountPopup
              visible={showAccountPopup}
              onClose={() => setShowAccountPopup(false)}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;