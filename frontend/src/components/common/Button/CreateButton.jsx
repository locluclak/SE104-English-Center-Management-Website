import React from 'react';
import BaseButton from './BaseButton';

const CreateButton = ({ onClick, disabled = false, children = 'Create' }) => (
  <BaseButton
    onClick={onClick}
    className="btn-create"
    disabled={disabled}
    type="submit"
  >
    {children}
  </BaseButton>
);

export default CreateButton;
