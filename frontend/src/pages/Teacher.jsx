import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from '../components/SidebarSearch';
import './Teacher.css';

const TeacherPage = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [searchKey, setSearchKey] = useState('');

  return (
    <div className="teacher-page">
      <Navbar role="teacher" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="teacher-content">
        <SidebarSearch
          role="teacher"
          activeTab={activeTab}
          onSearch={setSearchKey}
        />

        <div className="teacher-main">
          <h2>Teacher Dashboard</h2>
          <p>Tab: {activeTab}</p>
          <p>Search Key: {searchKey}</p>
          {/* Bạn có thể render thêm nội dung chính tương ứng ở đây */}
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;