import React, { useEffect, useState } from 'react';
import './SidebarSearch.css';

function SidebarSearch({ activeTab, onSearch, onNew }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    switch (activeTab) {
      case 'classes':
        setSearchResults(['Waiting', 'Current', 'End']);
        break;
      case 'students':
        setSearchResults(['View All', 'Enrolled', 'Unenroll']);
        break;
      case 'staffs':
        setSearchResults(['Admin', 'Teacher', 'Accountant']);
        break;
      default:
        setSearchResults([]);
    }
    setSearchTerm('');
  }, [activeTab]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    const allItems = {
      classes: ['Waiting', 'Current', 'End'],
      students: ['View All', 'Enrolled', 'Unenroll'],
      staffs: ['Admin', 'Teacher', 'Accountant'],
    };
    const filtered = allItems[activeTab]?.filter((item) =>
      item.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setSearchResults(filtered || []);
  };

  const handleItemClick = (item) => {
    onItemSelected(item);
  };

  const getSidebarItems = () => {
    switch (activeTab) {
      case 'classes':
        return ['Waiting', 'Current', 'End'];
      case 'students':
        return ['View All', 'Enrolled', 'Unenroll'];
      case 'staffs':
        return ['Admin', 'Teacher', 'Accountant'];
      default:
        return [];
    }
  };

  const [showClassForm, setShowClassForm] = useState(false);

  const handleNew = () => {
    if (activeTab === 'classes') {
      setShowClassForm(true);
    }
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

        {activeTab === 'classes' && (
          <button className="add-button" onClick={onNew}>
            + Add
          </button>
        )}
      </div>

      <div className="search-results">
        {getSidebarItems().map((item, index) => (
          <div
            key={index}
            className="search-item"
            onClick={() => console.log(`${activeTab} - ${item} clicked`)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SidebarSearch;
