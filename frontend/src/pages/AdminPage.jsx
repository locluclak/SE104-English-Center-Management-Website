import React, { useState } from 'react';
import { FaHome, FaPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';

import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleAddClassClick = () => {
    console.log('Add New Class clicked');
  };

  const handleStaffManagementClick = (staffType) => {
    setActiveTab(staffType);
  };

  const adminLinks = [
    { key: 'home', icon: FaHome },
    { key: 'classes', name: 'Classes' },
    { key: 'students', name: 'Students' },
    { key: 'staffs', name: 'Staffs' },
  ];

  return (
    <div className="admin-container">
      <Navbar
        role="admin"
        links={adminLinks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Content */}
      <div className="content">
        {activeTab === 'home' && (
          <div className="dashboard">
            
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="class-management-page">
            <h2>Class Management</h2>
            <button className="add-class-button" onClick={handleAddClassClick}>
              <FaPlus className="add-icon" /> Add Class
            </button>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="staff-management-page">
            <h2>Staff Management</h2>
            <div className="staff-options">
              <button onClick={() => handleStaffManagementClick('admins')}>Admin</button>
              <button onClick={() => handleStaffManagementClick('teachers')}>Teacher</button>
              <button onClick={() => handleStaffManagementClick('accountants')}>Accountant</button>
            </div>
          </div>
        )}

        {activeTab === 'admins' && <h2>Admin Management</h2>}
        {activeTab === 'teachers' && <h2>Teacher Management</h2>}
        {activeTab === 'accountants' && <h2>Accountant Management</h2>}
        {activeTab === 'pointReport' && <h2>Point Report</h2>}
      </div>
    </div>
  );
};

export default AdminPage;
