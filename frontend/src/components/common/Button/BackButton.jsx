import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseButton from './BaseButton';
import { FaArrowLeft } from 'react-icons/fa'; // dùng FontAwesome hoặc react-icons

const BackButton = ({ className = '', children = 'Back' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <BaseButton onClick={handleBack} className={`back-button ${className}`}>
      <FaArrowLeft style={{ marginRight: '8px' }} />
      {children}
    </BaseButton>
  );
};

export default BackButton;
