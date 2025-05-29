import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import SidebarSearch from '../components//layout/SidebarSearch';

import CurrentTab from "../components/TeacherPage/ClassesTab/CurrentTab";
import EndTab from "../components/TeacherPage/ClassesTab/EndTab";
import ClassDetail from "../components/TeacherPage/ClassesTab/ClassDetail";

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

  const handleFeatureSelect = (featureKey) => {
    setSelectedFeature(featureKey);
  };
  
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
                  <ClassDetail
                  className={selectedClass}
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