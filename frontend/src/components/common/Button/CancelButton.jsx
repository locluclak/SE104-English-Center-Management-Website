import React from 'react';
import BaseButton from './BaseButton';

const CancelButton = ({ onClick, disabled = false, children = 'Cancel' }) => (
  <BaseButton
    onClick={onClick}
    className="btn-cancel"
    disabled={disabled}
    type="button"
  >
    {children}
  </BaseButton>
);

export default CancelButton;
