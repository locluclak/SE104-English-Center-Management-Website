import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import './AccountPopup.css';

const AccountPopup = ({ visible, onClose }) => {
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !showProfile // chỉ đóng khi không mở profile
      ) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose, showProfile]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleViewProfile = () => {
    setShowProfile(true);
    onClose(); // đóng popup menu
  };

  const handleCloseProfile = () => {
    setShowProfile(false); // đóng modal profile
  };

  return (
    <>
      {visible && (
        <div className="account-popup" ref={popupRef}>
          <h4>Tài khoản</h4>
          <ul>
            <li onClick={handleViewProfile}>Thông tin cá nhân</li>
            <li>Cài đặt</li>
            <li onClick={handleLogout}>Đăng xuất</li>
          </ul>
        </div>
      )}

      {showProfile && (
        <ProfileModal
          visible={showProfile}
          onClose={handleCloseProfile}
        />
      )}
    </>
  );
};

export default AccountPopup;
