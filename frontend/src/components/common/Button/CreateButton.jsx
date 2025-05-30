import React from 'react';
import BaseButton from './BaseButton';

const CreateButton = ({ onClick, disabled }) => (
  <BaseButton onClick={onClick} className="btn-create" disabled={disabled}>
    Create
  </BaseButton>
);

export default CreateButton;
