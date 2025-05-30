import React from 'react';

const BaseButton = ({ onClick, children, className = '', disabled = false }) => {
  return (
    <button 
      className={`btn ${className}`} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default BaseButton;
