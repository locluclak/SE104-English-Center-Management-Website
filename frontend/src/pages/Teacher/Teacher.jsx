import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/layout/Header/Header.jsx';

import CurrentTab from "../../components/layout/ClassesTab/TeacherPage/CurrentTab.jsx";
import EndTab from "../../components/layout/ClassesTab/TeacherPage/EndTab.jsx";
import CourseDetail from "../../components/layout/Course/CourseDetail/CourseDetail.jsx";

import Calendar from '../../components/layout/Calendar/CalendarTab.jsx';
import Padlet from '../../components/layout/Padlet/PadletTab.jsx';

import './Teacher.css';

const TeacherPage = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('current');
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    const storedTeacherId = localStorage.getItem('userId');
    if (storedTeacherId) {
      setTeacherId(Number(storedTeacherId));
      console.log("Teacher ID:", Number(storedTeacherId));
    } else {
      console.warn("User ID (formerly Teacher ID) not found in localStorage. User might not be logged in or ID not saved.");
    }

    if (activeTab === 'classes' && selectedFeature !== 'current' && selectedFeature !== 'end') {
      setSelectedFeature('current');
    } else if (activeTab === 'dashboard' && selectedFeature !== 'calendar' && selectedFeature !== 'padlet') {
      setSelectedFeature('calendar');
    }
  }, [activeTab, selectedFeature]);

  const handleNew = () => {
    console.log('TeacherPage: handleNew called');
  };

  const handleClassClick = (className) => {
    console.log(`Clicked class: ${className}`);
    setSelectedClass(className);
  };

  const handleFeatureSelect = useCallback((featureKey, tabKey) => {
    console.log('handleFeatureSelect called with:', featureKey, 'for tab:', tabKey);
    setSelectedFeature(featureKey);
    setActiveTab(tabKey); 
  }, []);

  return (
    <div className="teacher-page">
      <Header 
        role="teacher" 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onFeatureSelect={handleFeatureSelect} 
      />

      <div className="teacher-body">
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