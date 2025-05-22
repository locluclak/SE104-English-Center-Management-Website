import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from "../components/SidebarSearch";

import CourseAd from "../components/StudentPage/CoursesTab/CourseAd";
import CourseSection from "../components/StudentPage/CoursesTab/CourseSection";
import CourseDetail from "../components/StudentPage/CoursesTab/CourseDetail";

import Calendar from '../components/StudentPage/DashboardTab/CalendarTab';
import Padlet from '../components/StudentPage/DashboardTab/PadletTab';

import './Student.css';

const StudentPage = () => {
  // activeTab luôn là chữ thường: 'courses' hoặc 'dashboard'
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  // selectedDashboardFeature lưu key, ví dụ 'calendar', 'padlet'
  const [selectedDashboardFeature, setSelectedDashboardFeature] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      // Khi chuyển sang tab dashboard, mặc định chọn item đầu tiên là 'calendar'
      setSelectedDashboardFeature('calendar');
    } else {
      // Khi chuyển sang courses, reset selectedDashboardFeature
      setSelectedDashboardFeature('');
    }
  }, [activeTab]);

  const handleNew = () => {
    console.log('StudentPage: handleNew called');
  };

  const handleClassClick = (className) => {
    console.log(`Clicked class: ${className}`);
    setSelectedClass(className);
  };

  return (
    <div className="student-page">
      <Navbar role="student" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="student-body">
        <SidebarSearch
          role="student"
          activeTab={activeTab}
          onSearch={(itemKey) => {
            if (activeTab === 'courses') {
              console.log(`Courses tab item selected: ${itemKey}`);
            } else if (activeTab === 'dashboard') {
              setSelectedDashboardFeature(itemKey);
            }
          }}
          onNew={handleNew}
        />

        <div className="content">
          {activeTab === 'courses' && (
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '20px' }}>
              {selectedClass ? (
                <CourseDetail
                  className={selectedClass}
                  onBack={() => setSelectedClass(null)}
                />
              ) : (
                <>
                  <CourseAd />
                  <CourseSection
                    title="Khoá học nghe đọc"
                    classList={['Class A', 'Class B']}
                    onClassClick={handleClassClick}
                  />
                  <CourseSection
                    title="Khoá học nói viết"
                    classList={['Class C', 'Class D']}
                    onClassClick={handleClassClick}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div style={{ marginLeft: '20px' }}>
              {selectedDashboardFeature === 'calendar' && <Calendar />}
              {selectedDashboardFeature === 'padlet' && <Padlet />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;