import React from 'react';
import BaseButton from './BaseButton';

const DeleteButton = ({ onClick, disabled = false, children = 'Delete' }) => (
  <BaseButton
    onClick={onClick}
    className="btn-delete"
    disabled={disabled}
    type="button"
  >
    {children}
  </BaseButton>
);

export default DeleteButton;
