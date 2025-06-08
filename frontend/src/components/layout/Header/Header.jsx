import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import NotificationPopup from '../Notification/NotificationPopup';
import AccountPopup from '../Account/AccountPopup';
import { itemsByRole } from '../../../config/navigationConfig.jsx';
import './Header.css';

const Header = ({ role, activeTab, setActiveTab, onNavigateSection, onFeatureSelect }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); 

  const navigate = useNavigate();

  const mainTabKeys = Object.keys(itemsByRole[role] || {}).filter(key => key !== 'home');

  const notifications = [
    { id: 1, message: "Bạn có đơn đăng ký mới." },
    { id: 2, message: "Lịch học hôm nay có thay đổi." },
    { id: 3, message: "Phiên bản mới đã được cập nhật." },
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleTabClick = (key) => {
    setActiveTab(key);
    setOpenDropdown(null); 
    if (role !== 'admin' && itemsByRole[role]?.[key]?.length > 0 && onFeatureSelect) {
        onFeatureSelect(itemsByRole[role][key][0].key, key);
    }
  };

  const handleDropdownItemClick = (featureKey, tabKey) => {
    onFeatureSelect(featureKey, tabKey);
    setOpenDropdown(null);
  };

  const handleMouseEnter = (key) => {
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>EngToeic-Center</h1>
        </div>

        <div className="navbar-right">
          <ul className="navbar-center">
            {role && itemsByRole[role]?.home && (
                <li
                    key="home"
                    onClick={() => handleTabClick('home')}
                    className={activeTab === 'home' ? 'active' : ''}
                >
                    <span>Home</span>
                </li>
            )}

            {mainTabKeys.map((key) => (
              role === 'admin' ? (
                <li
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={activeTab === key ? 'active' : ''}
                >
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </li>
              ) : (
                <li
                  key={key}
                  className={`dropdown-wrapper ${activeTab === key ? 'active' : ''}`}
                  onMouseEnter={() => handleMouseEnter(key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <span onClick={() => handleTabClick(key)}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} <span className="dropdown-arrow">&#9660;</span>
                  </span>
                  
                  {openDropdown === key && itemsByRole[role]?.[key]?.length > 0 && (
                    <ul className="dropdown-menu">
                      {itemsByRole[role][key].map((item) => (
                        <li 
                          key={item.key} 
                          onClick={() => handleDropdownItemClick(item.key, key)}
                        >
                          {item.icon} {item.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            ))}

            {!role && (
              <>
                <li onClick={() => onNavigateSection?.('about')}>
                  <span>About Me</span>
                </li>
                <li onClick={() => onNavigateSection?.('courses')}>
                  <span>Courses</span>
                </li>
              </>
            )}
          </ul>

          {role ? (
            <>
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
            </>
          ) : (
            <div className="auth-buttons">
              <button className="auth-button" onClick={handleLogin}>Login</button>
              <button className="auth-button" onClick={handleSignup}>Signup</button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Header;