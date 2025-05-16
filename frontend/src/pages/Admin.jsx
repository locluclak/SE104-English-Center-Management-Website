import React, { useState } from 'react';
import { FaHome, FaPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './Admin.css';

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
    { key: 'classes', name: 'Class Management' },
    { key: 'staff', name: 'Staff Management' },
    { key: 'pointReport', name: 'Point Report' },
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
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Students</h3>
              </div>
              <div className="stat-card">
                <h3>Active Classes</h3>
              </div>
              <div className="stat-card">
                <h3>Monthly Revenue</h3>
              </div>
            </div>
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