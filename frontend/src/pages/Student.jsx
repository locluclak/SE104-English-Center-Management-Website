import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/layout/Header/Header';
import SidebarSearch from "../components/layout/Sidebar/SidebarSearch";

import Table from '../components/common/Table/Table';
import {
  getStudentTableColumns,
  getTeacherTableColumns,
  getAccountantTableColumns,
} from "../config/tableConfig.jsx";

import HomeContent from '../components/layout/HomeContent/HomeContent';
import CourseSection from "../components/layout/Course/CourseSection/CourseSection";
import Calendar from '../components/DashboardTab/CalendarTab';
import Padlet from '../components/DashboardTab/PadletTab';

import CourseDetail from '../components/layout/Course/CourseDetail/CourseDetail';
import CourseProgress from '../components/layout/Course/CourseProgress/CourseProgress';

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
                  {selectedFeature === 'my-courses' && (
                    selectedClass ? (
                      <>
                        <CourseDetail
                          className={selectedClass}
                          onBack={() => setSelectedClass(null)}
                        />
                        <CourseProgress className={selectedClass} />
                      </>
                    ) : (
                      <CourseSection
                        title="Khoá học của tôi"
                        classList={['My Class 1', 'My Class 2', 'My Class 3']}
                        onClassClick={handleClassClick}
                      />
                    )
                  )}

                  {selectedFeature === 'waiting' && (
                    selectedClass ? (
                      <>
                        <CourseDetail
                          className={selectedClass}
                          onBack={() => setSelectedClass(null)}
                        />
                        <CourseProgress className={selectedClass} />
                      </>
                    ) : (
                      <CourseSection
                        title="Khoá học đang chờ"
                        classList={['Waiting Class 1', 'Waiting Class 2']}
                        onClassClick={handleClassClick}
                      />
                    )
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