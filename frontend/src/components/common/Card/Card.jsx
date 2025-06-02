import React from 'react';
import './Card.css';
import DropdownMenu from '../Button/DropdownMenu'; // nhớ import component này

const Card = ({ title, children, onClick, onEdit, onDelete }) => {
  return (
    <div className="custom-card" onClick={onClick}>
      <div className="card-header">
        <h3>{title}</h3>
        <DropdownMenu onEdit={onEdit} onDelete={onDelete} />
      </div>
      {children && <div className="card-content">{children}</div>}
    </div>
  );
};

export default Card;
