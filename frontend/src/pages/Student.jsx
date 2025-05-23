import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from "../components/SidebarSearch";

import HomeTab from "../components/StudentPage/CoursesTab/HomeTab";
import MyCoursesTab from "../components/StudentPage/CoursesTab/MyCoursesTab";
import Calendar from '../components/StudentPage/DashboardTab/CalendarTab';
import Padlet from '../components/StudentPage/DashboardTab/PadletTab';

import CourseDetail from '../components/StudentPage/CoursesTab/CourseDetail';
import CourseProgress from '../components/StudentPage/CoursesTab/CourseProgress';

import './Student.css';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('home'); // 'home' hoặc 'my-courses'

  // Khi activeTab thay đổi, reset selectedFeature
  useEffect(() => {
    if (activeTab === 'courses') {
      setSelectedFeature('home');
    } else if (activeTab === 'dashboard') {
      setSelectedFeature('calendar');
    }
  }, [activeTab]);

  const handleNew = () => {
    console.log('StudentPage: handleNew called');
  };

  const handleClassClick = (className) => {
    console.log(`Clicked class: ${className}`);
    setSelectedClass(className);
  };

  const handleFeatureSelect = (featureKey) => {
    setSelectedFeature(featureKey);
  };

  return (
    <div className="student-page">
      <Navbar role="student" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="student-body">
        <SidebarSearch 
          role="student"
          activeTab={activeTab}
          onSearch={handleFeatureSelect}
          onNew={handleNew}
        />

        <div className="content">
          {activeTab === 'courses' && (
          <div className="course-display-area"> {/* Thêm class mới để styling */}
              {selectedClass ? (
                <>
                  <CourseDetail
                    className={selectedClass}
                    onBack={() => setSelectedClass(null)}
                  />
                  <CourseProgress className={selectedClass} /> {/* Đặt CourseProgress ở đây */}
                </>
              ) : (
                <>
                  {selectedFeature === 'home' && <HomeTab handleClassClick={handleClassClick} />}
                  {selectedFeature === 'my-courses' && <MyCoursesTab handleClassClick={handleClassClick} />}
                </>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              {selectedFeature === 'calendar' && <Calendar />}
              {selectedFeature === 'padlet' && <Padlet />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;