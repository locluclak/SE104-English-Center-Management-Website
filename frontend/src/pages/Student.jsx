import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from "../components/SidebarSearch";

import CourseAd from "../components/StudentPage/CoursesTab/CourseAd";
import CourseSection from "../components/StudentPage/CoursesTab/CourseSection";

import './Student.css';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleNew = () => {
    console.log('StudentPage: handleNew called');
  };

  const handleClassClick = (className) => {
    console.log(`Clicked class: ${className}`);
  };

  return (
    <div className="student-page">
      <Navbar role="student" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="student-body">
        <SidebarSearch
          role="student"
          activeTab={activeTab}
          onSearch={(item) => setSelectedStatus(item)}
          onNew={handleNew}
        />

        {activeTab === 'courses' && selectedStatus === "Home" && (
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '20px' }}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPage;
