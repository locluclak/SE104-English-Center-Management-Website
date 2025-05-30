import React from 'react';
import BaseButton from './BaseButton';

const CancelButton = ({ onClick, disabled = false }) => {
  return (
    <BaseButton onClick={onClick} disabled={disabled} className="btn-cancel" >
      Cancel
    </BaseButton>
  );
};

export default CancelButton;
