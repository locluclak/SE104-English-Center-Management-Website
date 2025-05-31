import React, { useState } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import NotificationPopup from './NotificationPopup';
import AccountPopup from './AccountPopup';
import { itemsByRole } from '../../config/navigationConfig.jsx'; // dùng lại config này
import './Header.css';

const Header = ({ role, activeTab, setActiveTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);

  const tabKeys = Object.keys(itemsByRole[role] || {});

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
            {tabKeys.map((key) => (
              <li
                key={key}
                onClick={() => setActiveTab(key)}
                className={activeTab === key ? 'active' : ''}
              >
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </li>
            ))}
          </ul>

          <div className="notification-wrapper" style={{ position: 'relative' }}>
            <FaBell
              className="icon"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowAccountPopup(false);
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
                setShowNotifications(false);
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

export default Header;
