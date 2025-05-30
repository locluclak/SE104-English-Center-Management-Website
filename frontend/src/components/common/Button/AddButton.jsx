import React from 'react';
import BaseButton from './BaseButton';

const AddButton = ({ onClick, disabled }) => (
  <BaseButton onClick={onClick} className="btn-add" disabled={disabled}>
    Add
  </BaseButton>
);

export default AddButton;
