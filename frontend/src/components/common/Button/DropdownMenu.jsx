import React, { useState, useRef, useEffect } from 'react';
import BaseButton from './BaseButton';
import './DropdownMenu.css';

const DropdownMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation(); // Ngăn sự kiện lan lên Card
    setOpen(!open);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (e) => {
    e.stopPropagation(); // Ngăn lan lên Card
    onEdit();
    setOpen(false); // Đóng menu sau khi chọn
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Ngăn lan lên Card
    onDelete();
    setOpen(false);
  };

  return (
    <div className="dropdown" ref={menuRef}>
      <BaseButton onClick={toggleMenu} className="dropdown-toggle">
        ⋮
      </BaseButton>
      {open && (
        <div className="dropdown-menu">
          <button onClick={onEdit} className="dropdown-item">Edit</button>
          <button onClick={onDelete} className="dropdown-item">Delete</button>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
