import React from 'react';
import BaseButton from './BaseButton';

const DeleteButton = ({ onClick, disabled }) => (
  <BaseButton onClick={onClick} className="btn-delete" disabled={disabled}>
    Delete
  </BaseButton>
);

export default DeleteButton;
