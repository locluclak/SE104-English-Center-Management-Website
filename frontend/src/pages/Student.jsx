import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from "../components/SidebarSearch";
import './Student.css';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleNew = () => {
    console.log('StudentPage: handleNew called (hiện không có chức năng)');
  };

  return (
    <div className="student-page">
      <Navbar
        role="student"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="student-body">
        <SidebarSearch
          role="student"
          activeTab={activeTab}
          onSearch={(item) => setSelectedStatus(item)}
          onNew={handleNew}
        />
      </div>

      <div className="content"></div>
    </div>
  );
};

export default StudentPage;
