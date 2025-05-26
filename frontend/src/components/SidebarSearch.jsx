import React, { useEffect, useState } from 'react';
import { FaHome, FaBookOpen, FaCalendarAlt, FaStickyNote, FaChild, FaMoneyCheckAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import { FaRegClock, FaReceipt } from 'react-icons/fa';

import './SidebarSearch.css';

const itemsByRole = {
  admin: {
    classes: [
      { key: 'waiting', name: 'Waiting' },
      { key: 'current', name: 'Current' },
      { key: 'end', name: 'End' },
    ],
    students: [
      { key: 'all', name: 'View All' },
      { key: 'enrolled', name: 'Enrolled' },
      { key: 'unenroll', name: 'Unenroll' },
    ],
    staffs: [
      { key: 'teacher', name: 'Teacher' },
      { key: 'accountant', name: 'Accountant' },
    ],
  },
  teacher: {
    classes: [
      { key: 'home', name: 'Home', icon: <FaHome /> },
      { key: 'my-classes', name: 'My Classes', icon: <FaBookOpen /> }
    ],
    dashboard: [
      { key: 'calendar', name: 'Calendar', icon: <FaCalendarAlt /> },
      { key: 'padlet', name: 'Padlet', icon: <FaStickyNote /> }
    ],
  },  
  student: {
    courses: [
      { key: 'home', name: 'Home', icon: <FaHome /> },
      { key: 'my-courses', name: 'My Courses', icon: <FaBookOpen /> }
    ],
    dashboard: [
      { key: 'calendar', name: 'Calendar', icon: <FaCalendarAlt /> },
      { key: 'padlet', name: 'Padlet', icon: <FaStickyNote /> }
    ],
  },
  accountant: {
    dashboard: [
      { key: 'calendar', name: 'Calendar', icon: <FaCalendarAlt /> },
      { key: 'padlet', name: 'Padlet', icon: <FaStickyNote /> }
    ],
    tuition: [
      { key: 'students', name: 'Students', icon: <FaChild /> },
      { key: 'classes', name: 'Classes', icon: <FaBookOpen /> }
    ],
    payments: [
      { key: 'transfer', name: 'Transfer', icon: <FaMoneyCheckAlt /> },
      { key: 'paid', name: 'Paid', icon: <FaFileInvoiceDollar /> },
      { key: 'unpaid', name: 'Unpaid', icon: <FaReceipt /> },
    ],
    reports: [
      { key: 'time', name: 'Time', icon: <FaRegClock /> },
      { key: 'classes', name: 'Classes', icon: <FaBookOpen /> }
    ], 
  },
};

function SidebarSearch({ role, activeTab, onSearch, onNew }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItemKey, setSelectedItemKey] = useState('');

  // Cập nhật menu khi role/tab thay đổi
  useEffect(() => {
    const items = itemsByRole[role]?.[activeTab] || [];
    setSearchResults(items);
    setSearchTerm('');

    if (items.length > 0) {
      setSelectedItemKey(items[0].key);
      onSearch?.(items[0].key); // gửi key về component cha
    }
  }, [role, activeTab]);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const allItems = itemsByRole[role]?.[activeTab] || [];
    const filtered = allItems.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleItemClick = (item) => {
    setSelectedItemKey(item.key);
    onSearch?.(item.key);
  };

  // Gọi khi bấm nút "Add"
  const handleAddClick = () => {
    if (onNew) onNew(); // gửi sự kiện lên component cha
  };

  return (
    <div className={`sidebar-search ${role}`}>
      <div className="search-header">
        {role === 'admin' && (
          <div className="search-box">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <span className="icon">🔍</span>
          </div>
        )}

        {onNew && role === 'admin' && (
          <button className="new-button" onClick={handleAddClick}>＋</button>
        )}
      </div>

      <div className="search-results">
        {searchResults.map((item) => (
          <div
            key={item.key}
            className={`search-item ${item.key === selectedItemKey ? 'selected' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <div className="icon-top">{item.icon}</div>
            <div className="text-below">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SidebarSearch;
