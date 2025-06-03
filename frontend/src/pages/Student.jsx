import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/layout/Header/Header';
import SidebarSearch from "../components/layout/Sidebar/SidebarSearch";

import Table from '../components/common/Table/Table';
import {
  getStudentTableColumns,
  getTeacherTableColumns,
  getAccountantTableColumns,
} from "../config/tableConfig.jsx";

import HomeTab from "../components/StudentPage/CoursesTab/HomeTab";
import MyCoursesTab from "../components/StudentPage/CoursesTab/MyCoursesTab";
import Calendar from '../components/DashboardTab/CalendarTab';
import Padlet from '../components/DashboardTab/PadletTab';

import CourseDetail from '../components/StudentPage/CoursesTab/CourseDetail';
import CourseProgress from '../components/StudentPage/CoursesTab/CourseProgress';

import './Student.css';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('home');

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

  const handleFeatureSelect = useCallback((featureKey) => {
    console.log('handleFeatureSelect called with:', featureKey);
    setSelectedFeature(featureKey);
  }, []);

  return (
    <div className="student-page">
      <Header role="student" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="student-body">
        <SidebarSearch 
          role="student"
          activeTab={activeTab}
          onSearch={handleFeatureSelect}
          onNew={handleNew}
        />

        <div className="content">
          {activeTab === 'courses' && (
          <div className="course-display-area"> 
              {selectedClass ? (
                <>
                  <CourseDetail
                    className={selectedClass}
                    onBack={() => setSelectedClass(null)}
                  />
                  <CourseProgress className={selectedClass} />
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