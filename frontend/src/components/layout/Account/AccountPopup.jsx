import React, { useEffect, useRef } from 'react';
import './AccountPopup.css';

const AccountPopup = ({ visible, onClose }) => {
  const ref = useRef(null);

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

  if (!visible) return null;

  return (
    <div className="account-popup" ref={ref}>
      <h4>Tài khoản</h4>
      <ul>
        <li>Thông tin cá nhân</li>
        <li>Cài đặt</li>
        <li>Đăng xuất</li>
      </ul>
    </div>
  );
};

export default AccountPopup;