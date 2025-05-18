import React, { useEffect, useState } from 'react';
import './SidebarSearch.css';

function SidebarSearch({ role, activeTab, onSearch, onNew }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Menu items theo từng role
  const itemsByRole = {
    admin: {
      classes: ['Waiting', 'Current', 'End'],
      students: ['View All', 'Enrolled', 'Unenroll'],
      staffs: ['Teacher', 'Accountant'],
    },
    teacher: {
      classes: ['Assigned', 'Completed'],
      students: ['My Students'],
    },
    student: {
      classes: ['My Classes', 'Available'],
    },
  };

  // Cập nhật danh sách theo activeTab + role
  useEffect(() => {
    const items = itemsByRole[role]?.[activeTab] || [];
    setSearchResults(items);
    setSearchTerm('');
  }, [activeTab, role]);

  // Xử lý tìm kiếm
  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    const fullList = itemsByRole[role]?.[activeTab] || [];
    const filtered = fullList.filter(item =>
      item.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // Click từng item trong sidebar
  const handleItemClick = (item) => {
    if (onSearch) onSearch(item);
  };

  // Hiển thị danh sách các item trong sidebar
  const renderSidebarItems = () => {
    return searchResults.map((item, index) => (
      <div
        key={index}
        className="search-item"
        onClick={() => handleItemClick(item)}
      >
        {item}
      </div>
    ));
  };

  // Gọi khi bấm nút "Add"
  const handleAddClick = () => {
    if (onNew) onNew(); // gửi sự kiện lên component cha
  };

  return (
    <div className="sidebar-search">
      <div className="search-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Nút Add cho admin ở tab Classes */}
        {role === 'admin' && activeTab === 'classes' && (
          <button className="new-button" onClick={handleAddClick}>＋</button>
        )}
      </div>

      <div className="search-results">
        {renderSidebarItems()}
      </div>
    </div>
  );
}

export default SidebarSearch;
