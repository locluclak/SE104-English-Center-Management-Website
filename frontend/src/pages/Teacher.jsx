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

import Calendar from '../components/DashboardTab/CalendarTab';
import Padlet from '../components/DashboardTab/PadletTab';

import './Teacher.css';

const TeacherPage = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('home');

  useEffect(() => {
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
            <div className="class-display-area"> {/* Thêm class mới để styling */}
              {selectedClass ? (
                <>
                  <CourseDetail
                  clsId={selectedClass}
                  onBack={() => setSelectedClass(null)}
                />
              </>
              ) : (
                <>
                  {selectedFeature === 'current' && <CurrentTab handleClassClick={handleClassClick} />}
                  {selectedFeature === 'end' && <EndTab handleClassClick={handleClassClick} />}
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