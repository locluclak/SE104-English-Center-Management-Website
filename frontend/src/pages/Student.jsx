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
import WaitingTab from "../components/layout/ClassesTab/StudentPage/WaitingTab";
import CourseDetail from "../components/layout/Course/CourseDetail/CourseDetail";
import CourseProgress from "../components/layout/Course/CourseProgress/CourseProgress";
import HomeContent from '../components/layout/HomeContent/HomeContent';
import Calendar from '../components/layout/Calendar/CalendarTab';
import Padlet from '../components/layout/Padlet/PadletTab';

import './Student.css';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('my-course');
  const [currentStudentId, setCurrentStudentId] = useState('your_student_id_here');

  useEffect(() => {
    const storedStudentId = localStorage.getItem('userId');
    console.log("Stored studentId from localStorage:", storedStudentId); 
    if (storedStudentId) {
        setCurrentStudentId(storedStudentId);
    } else {
      console.warn("Student ID not found in localStorage. MyCoursesTab might not display correctly.");
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'courses') {
      setSelectedFeature('my-courses');
    } else if (activeTab === 'dashboard') {
      setSelectedFeature('calendar');
    }
  }, [activeTab]);

  const handleNew = () => {
    console.log('StudentPage: handleNew called');
  };

  const handleClassClick = (classId) => {
    console.log(`Clicked class ID: ${classId}`);
    setSelectedClass(classId);
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

            <div className="stu-content">    
              {activeTab === 'courses' && (
                <div className="course-display-area"> 
                  {selectedClass ? (
                    <div className="course-inside">
                      <CourseDetail
                        clsId={selectedClass}
                        onBack={() => setSelectedClass(null)}
                      />
                      <CourseProgress className={selectedClass} />
                    </div>
                  ) : (
                    <>
                      {selectedFeature === 'my-courses' && 
                        <>
                          {console.log("Passing studentId to MyCoursesTab:", currentStudentId)} 
                          <MyCoursesTab 
                            studentId={currentStudentId} 
                            handleClassClick={handleClassClick} 
                          />
                        </>
                      }
                      {selectedFeature === 'waiting' && 
                        <WaitingTab 
                          studentId={currentStudentId}
                          handleClassClick={handleClassClick} 
                        />
                      }
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