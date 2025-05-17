import React, { useState } from 'react';
import { FaHome, FaPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import SidebarSearch from '../components/SidebarSearch';
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
    { key: 'classes', name: 'Classes' },
    { key: 'students', name: 'Students' },
    { key: 'staffs', name: 'Staffs' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(['']);
  
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  const handleNew = () => {
    alert('Thêm mới');
  };
  
  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="admin-container">
      <Navbar
        role="admin"
        links={adminLinks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="admin-body">
        <SidebarSearch
          items={filteredItems}
          onSearch={handleSearch}
          onNew={handleNew}
        />

        <div className="content">
          {activeTab === 'home' && (
            <div className="dashboard"></div>
          )}

          {activeTab === 'classes' && (<div className="class-management-page"></div>)}

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
    </div>
  );
};

export default AdminPage;