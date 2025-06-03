import React from 'react';
import './BaseButton.css';

const BaseButton = ({
  onClick,
  children,
  className = '',
  disabled = false,
  type = 'button', // ⚠️ tránh bị mặc định là "submit" trong form
}) => {
  return (
    <button
      type={type}
      className={`btn ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default BaseButton;
