import React, { useState } from 'react';
import './Student.css';
import { FaSearch } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [courses, setCourses] = useState([]);

  const navLinks = [
    { key: 'home', name: 'Home' },
    { key: 'classes', name: 'Classes' },
    { key: 'dashboard', name: 'Dashboard' },
  ];

  return (
    <div className="student-page">
      {/* Navbar Component */}
      <Navbar
        role="student"
        links={navLinks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Content */}
      <div className="content">
        {activeTab === 'home' && (
          <div className="home-content">
            {/* Nội dung trang chủ */}
          </div>
        )}

        {activeTab === 'classes' && <div>My Courses</div>}
        {activeTab === 'dashboard' && <div>Assignment</div>}
        {activeTab === 'notification' && <div>Notification Content</div>}
        {activeTab === 'account' && <div>Account Content</div>}
      </div>
    </div>
  );
};

export default StudentPage;
