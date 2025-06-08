import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/layout/Header/Header.jsx';
import SidebarSearch from '../components/layout/Sidebar/SidebarSearch';

import Table from '../components/common/Table/Table';
import {
  getStudentTableColumns,
  getTeacherTableColumns,
  getAccountantTableColumns,
} from "../config/tableConfig.jsx";

import CurrentTab from "../components/layout/ClassesTab/TeacherPage/CurrentTab";
import EndTab from "../components/layout/ClassesTab/TeacherPage/EndTab";
import CourseDetail from "../components/layout/Course/CourseDetail/CourseDetail";

import Calendar from '../components/layout/Calendar/CalendarTab.jsx';
import Padlet from '../components/layout/Padlet/PadletTab.jsx';

import './Teacher.css';

const TeacherPage = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('home');
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    const storedTeacherId = localStorage.getItem('userId');
    if (storedTeacherId) {
      setTeacherId(Number(storedTeacherId));
      console.log("Teacher ID:", Number(storedTeacherId));
    } else {
      console.warn("User ID (formerly Teacher ID) not found in localStorage. User might not be logged in or ID not saved.");
    }

    if (activeTab === 'classes') {
      setSelectedFeature('current');
    } else if (activeTab === 'dashboard') {
      setSelectedFeature('calendar');
    }
  }, [activeTab]);

  const handleNew = () => {
    console.log('TeacherPage: handleNew called');
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
    <div className="teacher-page">
      <Header role="teacher" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="teacher-content">
        <SidebarSearch
          role="teacher"
          activeTab={activeTab}
          onSearch={handleFeatureSelect}
          onNew={handleNew}
        />

        <div className="content">
          {activeTab === 'classes' && (
            <div className="class-display-area">
              {selectedClass ? (
                <>
                  <CourseDetail
                    clsId={selectedClass}
                    onBack={() => setSelectedClass(null)}
                  />
                </>
              ) : (
                <>
                  {teacherId ? (
                    <>
                      {selectedFeature === 'current' && <CurrentTab handleClassClick={handleClassClick} teacherId={teacherId} />}
                      {selectedFeature === 'end' && <EndTab handleClassClick={handleClassClick} teacherId={teacherId} />}
                    </>
                  ) : (
                    <p>Đang tải thông tin giáo viên...</p> 
                  )}
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

export default TeacherPage;