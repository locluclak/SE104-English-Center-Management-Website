import React from 'react';
import BaseButton from './BaseButton';

const BackButton = ({ onClick, disabled = false, children = 'Back' }) => (
  <BaseButton
    onClick={onClick}
    className="btn-back"
    disabled={disabled}
    type="button"
  >
    {children}
  </BaseButton>
);

export default BackButton;
