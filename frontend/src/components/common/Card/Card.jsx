import React from 'react';
import './Card.css';

const Card = ({ title, children, onClick }) => {
  return (
    <div className="custom-card" onClick={onClick}>
      <h3>{title}</h3>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
