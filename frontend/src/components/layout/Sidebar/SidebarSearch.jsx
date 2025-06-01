import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { itemsByRole, paymentSubItems } from '../../../config/navigationConfig.jsx';
import './SidebarSearch.css';

function SidebarSearch({ role, activeTab, onSearch, onNew }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMainKey, setSelectedMainKey] = useState('');
  const [selectedSubKey, setSelectedSubKey] = useState('');
  const [subMenu, setSubMenu] = useState([]);

  // Cập nhật menu khi role/tab thay đổi
  useEffect(() => {
    const items = itemsByRole[role]?.[activeTab] || [];
    setSearchResults(items);
    setSearchTerm('');

    if (items.length > 0) {
      const defaultItem = items[0];
      setSelectedMainKey(defaultItem.key);
      setSelectedSubKey('');


      if (role === 'accountant' && activeTab === 'tuition' && defaultItem.key === 'students') {
        setSubMenu(paymentSubItems);
        setSelectedSubKey('transfer');
        onSearch?.('transfer');
      } else {
        onSearch?.(defaultItem.key);
      }
    }
  }, [role, activeTab, onSearch]);

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
    setSelectedMainKey(item.key);
    setSelectedSubKey('');
    if (role === 'accountant' && activeTab === 'tuition' && item.key === 'students') {
      setSubMenu(paymentSubItems);
      setSelectedSubKey('transfer');
      onSearch?.('transfer');
    } else {
      setSubMenu([]);
      setSelectedSubKey('');
      onSearch?.(item.key);
    }
  };

  const handleSubItemClick = (item) => {
    setSelectedSubKey(item.key);
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
            <span className="icon"> <FaSearch /> </span>
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
            className={`search-item ${item.key === selectedMainKey ? 'selected' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <div className="icon-top">{item.icon}</div>
            <div className="text-below">{item.name}</div>
          </div>
        ))}

        {subMenu.length > 0 && (
          <div className="submenu">
            {subMenu.map((item) => (
              <div
                key={item.key}
                className={`sub-item ${item.key === selectedSubKey ? 'selected' : ''}`}
                onClick={() => handleSubItemClick(item)}
              >
                <span className="sub-icon">{item.icon}</span> {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SidebarSearch;
