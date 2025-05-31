import React, { useEffect, useRef } from 'react';
import './NotificationPopup.css'; // Tạo file CSS riêng cho popup nếu muốn

const NotificationPopup = ({ notifications, visible, onClose }) => {
  const ref = useRef(null);

  // Đóng popup khi click ngoài
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
    <div className="notification-popup" ref={ref}>
      <h4>Thông báo</h4>
      <ul>
        {notifications.length === 0 && <li>Không có thông báo mới</li>}
        {notifications.map((noti) => (
          <li key={noti.id}>{noti.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPopup;