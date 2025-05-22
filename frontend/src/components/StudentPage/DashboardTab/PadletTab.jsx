// PadletTab.js (hoặc Padlet.js)
import React from 'react';
//import './PadletTab.css'; // Nếu bạn có CSS cho Padlet

const Padlet = () => {
  return (
    <div className="padlet-container">
      <h2>Bảng ghi chú & Thông báo</h2>
      <p>Truy cập Padlet để xem các thông báo quan trọng, tài liệu học tập và các ghi chú từ giáo viên.</p>
      {/* <button onClick={() => alert('Chuyển đến trang chi tiết Padlet')}>Xem chi tiết Padlet</button> */}
    </div>
  );
};

export default Padlet;