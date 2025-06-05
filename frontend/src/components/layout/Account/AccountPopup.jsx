import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import './AccountPopup.css';

const AccountPopup = ({ visible, onClose }) => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  const handleLogout = () => {
    // Example: Clear local storage token or user session
    localStorage.removeItem('userToken');
    // Redirect to login page
    navigate('/login');
  };

  const handleViewProfile = () => {
    setShowProfile(true);
    onClose();
  };

  return (
    <>
      <div className="account-popup" ref={ref}>
        <h4>Tài khoản</h4>
        <ul>
          <li onClick={handleViewProfile}>Thông tin cá nhân</li>
          <li>Cài đặt</li>
          <li onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>

      {showProfile && (
        <ProfileModal 
          onClose={() => setShowProfile(false)}
          visible={showProfile}
        />
      )}
    </>
  );
};

export default AccountPopup;
