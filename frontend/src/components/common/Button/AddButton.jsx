import React from 'react';
import BaseButton from './BaseButton';

const AddButton = ({ onClick, disabled = false, children = 'Add' }) => (
  <BaseButton
    onClick={onClick}
    className="btn-add"
    disabled={disabled}
    type="button"
  >
    {children}
  </BaseButton>
);

export default AddButton;
