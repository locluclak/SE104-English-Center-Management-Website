import React from 'react';
import { FaSearch, FaPen } from 'react-icons/fa';
import './SidebarSearch.css';

const SidebarSearch = ({ items, onSearch, onNew }) => {
  return (
    <div className="sidebar-search">
      <div className="search-header">
        <div className="search-box">
          <input type="text" placeholder="Tìm kiếm" onChange={(e) => onSearch(e.target.value)} />
          <FaSearch className="icon" />
        </div>
        <button className="new-button" onClick={onNew}>
          <FaPen />
        </button>
      </div>

      <div className="search-results">
        {items.map((item, index) => (
          <div key={index} className={`search-item ${index === 0 ? 'bold' : ''}`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarSearch;
