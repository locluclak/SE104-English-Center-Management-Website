// CalendarTab.js (hoặc Calendar.js)
import React from 'react';
//import './CalendarTab.css'; // Nếu bạn có CSS cho Calendar

const Calendar = () => {
  return (
    <div className="calendar-container">
      <h2>Lịch học & Sự kiện</h2>
      <p>Đây là nơi bạn có thể xem lịch học, các sự kiện sắp tới và các hoạt động của trường.</p>
      {/* Bạn có thể thêm một nút "Xem chi tiết" ở đây nếu muốn */}
      {/* <button onClick={() => alert('Chuyển đến trang chi tiết Lịch')}>Xem chi tiết Lịch</button> */}
    </div>
  );
};

export default Calendar;