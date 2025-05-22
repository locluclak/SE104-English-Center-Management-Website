import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import './CalendarTab.css';

const eventsList = [
  { id: '1', title: 'Bài thi trắc nghiệm', date: '2025-05-05' },
  { id: '2', title: 'Bứt phá điểm số', date: '2025-05-05' },
  { id: '3', title: 'Bài thi nói', date: '2025-05-15' },
];

const Calendar = () => {
  const calendarRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDateClick = (arg) => {
    alert(`Bạn đã click ngày ${arg.dateStr}`);
  };

  const handleNewEvent = () => {
    alert('Bạn muốn tạo sự kiện mới');
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
    setCurrentDate(calendarApi.getDate());
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
    setCurrentDate(calendarApi.getDate());
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
    setCurrentDate(calendarApi.getDate());
  };

  const handleDatesSet = (arg) => {
    setCurrentDate(arg.start);
  };

  return (
    <div className="calendar-tab-container">

      {/* Tiêu đề tháng tách riêng */}
      <div className="calendar-title">
        {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
      </div>

      {/* Nhóm 3 nút điều khiển ở góc trên bên phải */}
      <div className="calendar-controls">
        <button className="nav-button" onClick={handlePrev} aria-label="Previous month">‹</button>
        <button className="today-button" onClick={handleToday}>Today</button>
        <button className="nav-button" onClick={handleNext} aria-label="Next month">›</button>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={eventsList}
        dateClick={handleDateClick}
        headerToolbar={false}  // tắt toolbar mặc định
        dayMaxEvents={true}
        eventDisplay="block"
        height={600}
        datesSet={handleDatesSet}
      />
    </div>
  );
};

export default Calendar;