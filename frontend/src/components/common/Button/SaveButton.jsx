import React from 'react';
import BaseButton from './BaseButton';

const SaveButton = ({ onClick, disabled = false, children = 'Save' }) => (
  <BaseButton
    onClick={onClick}
    className="btn-save"
    disabled={disabled}
    type="submit"
  >
    {children}
  </BaseButton>
);

export default SaveButton;
