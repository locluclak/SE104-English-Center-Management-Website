import React, { useState, useEffect } from 'react';
import './AddStaffForm.css';

const AddAccountantForm = ({ isEditMode, initialData, onClose, onSubmitSuccess }) => {
  const [accountantId, setAccountantId] = useState('');
  const [accountantName, setAccountantName] = useState('');
  const [accountantEmail, setAccountantEmail] = useState('');
  const [accountantPassword, setAccountantPassword] = useState('');
  const [accountantDepartment, setAccountantDepartment] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setAccountantId(initialData.ID || '');
      setAccountantName(initialData.NAME || '');
      setAccountantEmail(initialData.EMAIL || '');
      // Không set password khi edit vì lý do bảo mật
      setAccountantDepartment(initialData.DEPARTMENT || '');
    } else {
      // Reset form khi không edit hoặc không có dữ liệu
      setAccountantId('');
      setAccountantName('');
      setAccountantEmail('');
      setAccountantPassword('');
      setAccountantDepartment('');
    }
  }, [isEditMode, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSubmit = {
      ID: accountantId,
      NAME: accountantName,
      EMAIL: accountantEmail,
      PASSWORD: accountantPassword, // Bỏ trống khi edit nếu không thay đổi mật khẩu
      DEPARTMENT: accountantDepartment,
    };

    // TODO: gọi API tạo mới hoặc cập nhật tùy isEditMode
    console.log(isEditMode ? 'Updating accountant:' : 'Creating accountant:', dataToSubmit);

    if (onSubmitSuccess) onSubmitSuccess(dataToSubmit, isEditMode);
    onClose();
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <h2>{isEditMode ? 'Edit Accountant' : 'Create New Accountant'}</h2>

      <div className="form-row">
        <input
          type="text"
          placeholder="Accountant ID (e.g., A001)"
          value={accountantId}
          onChange={(e) => setAccountantId(e.target.value)}
          required
          disabled={isEditMode} // Khóa ID khi chỉnh sửa
        />
        <input
          type="text"
          placeholder="Full Name"
          value={accountantName}
          onChange={(e) => setAccountantName(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <input
          type="email"
          placeholder="Email Address"
          value={accountantEmail}
          onChange={(e) => setAccountantEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={isEditMode ? "Leave blank to keep current password" : "Password"}
          value={accountantPassword}
          onChange={(e) => setAccountantPassword(e.target.value)}
          required={!isEditMode}
        />
      </div>

      <div className="form-row">
        <input
          type="text"
          placeholder="Department (e.g., Finance, Billing)"
          value={accountantDepartment}
          onChange={(e) => setAccountantDepartment(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="submit">{isEditMode ? 'Update' : 'Create'}</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default AddAccountantForm;