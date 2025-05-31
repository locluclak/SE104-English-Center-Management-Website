import React from 'react';
import BaseButton from './BaseButton';

const EditButton = ({ onClick, disabled = false, children = 'Edit' }) => (
  <BaseButton
    onClick={onClick}
    className="btn-edit"
    disabled={disabled}
    type="button"
  >
    {children}
  </BaseButton>
);

export default EditButton;
