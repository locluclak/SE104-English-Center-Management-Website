import React from 'react';
import BaseButton from './BaseButton';

const EditButton = ({ onClick, disabled }) => (
  <BaseButton onClick={onClick} className="btn-edit" disabled={disabled}>
    Edit
  </BaseButton>
);

export default EditButton;
