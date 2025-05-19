// SidebarSearch.js
import React from 'react';
import './SidebarSearch.css';

const SidebarSearch = ({
  activeTabKeyForSidebar, // 'classes', 'students', 'staffs' (để biết nhóm menu nào cần hiển thị)

  // Props cho Classes
  classFilterItems = [],
  selectedClassFilter,
  onSelectClassFilter,

  // Props cho Students
  studentStatusFilters = [],
  selectedStudentStatus,
  onSelectStudentStatus,

  // Props cho Staffs
  staffSubNavigationItems = [],
  selectedStaffSubCategory,
  onSelectStaffSubCategory,

  onNew, // Nút "+"
}) => {
  return (
    <div className="sidebar-search">
      <div className="search-header">
        <div className="search-box">
          <input type="text" placeholder="Search..." />
          <span className="icon">🔍</span>
        </div>
        {onNew && (
          <button className="new-button" onClick={onNew}>+</button>
        )}
      </div>

      {/* Menu cho Classes */}
      {activeTabKeyForSidebar === 'classes' && classFilterItems.length > 0 && (
        <div className="menu-items">
          <h3>Class Status</h3> {/* Hoặc bạn có thể bỏ title này */}
          {classFilterItems.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${selectedClassFilter === item.key ? 'selected' : ''}`}
              onClick={() => onSelectClassFilter(item.key)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}

      {/* Menu cho Students */}
      {activeTabKeyForSidebar === 'students' && studentStatusFilters.length > 0 && (
        <div className="menu-items">
          <h3>Student Status</h3> {/* Hoặc bạn có thể bỏ title này */}
          {studentStatusFilters.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${selectedStudentStatus === item.key ? 'selected' : ''}`}
              onClick={() => onSelectStudentStatus(item.key)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
      
      {/* Menu cho Staffs */}
      {activeTabKeyForSidebar === 'staffs' && staffSubNavigationItems.length > 0 && (
        <div className="menu-items">
          {/* Không cần title nếu "Teacher" và "Accountant" là các mục chính */}
          {staffSubNavigationItems.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${selectedStaffSubCategory === item.key ? 'selected' : ''}`}
              onClick={() => onSelectStaffSubCategory(item.key)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarSearch;