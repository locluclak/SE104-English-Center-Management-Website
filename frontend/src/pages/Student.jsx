import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/layout/Header/Header';
import SidebarSearch from "../components/layout/Sidebar/SidebarSearch";

import Table from '../components/common/Table/Table';
import {
  getStudentTableColumns,
  getTeacherTableColumns,
  getAccountantTableColumns,
} from "../config/tableConfig.jsx";

import MyCoursesTab from "../components/layout/ClassesTab/StudentPage/MyCoursesTab";
import CourseDetail from "../components/layout/Course/CourseDetail/CourseDetail";
import CourseProgress from "../components/layout/Course/CourseProgress/CourseProgress";
import HomeContent from '../components/layout/HomeContent/HomeContent';
import Calendar from '../components/DashboardTab/CalendarTab';
import Padlet from '../components/DashboardTab/PadletTab';

import './Student.css';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('my-course');

  useEffect(() => {
    if (activeTab === 'courses') {
      setSelectedFeature('my-course');
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
        {activeTab === 'home' && (
          <div className="home-container">
            <HomeContent handleClassClick={handleClassClick} />
          </div>
        )}

        {activeTab !== 'home' && (
          <>
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
         </>
        )}
      </div>
    </div>
  );
};

export default StudentPage;