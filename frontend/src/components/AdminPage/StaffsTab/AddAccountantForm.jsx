// AddAccountantForm.js
import React, { useState } from 'react';
import './AddStaffForm.css'; // Sử dụng một file CSS chung cho các form hoặc tạo file riêng

const AddAccountantForm = ({ onClose, onSubmitSuccess }) => {
  const [accountantId, setAccountantId] = useState('');
  const [accountantName, setAccountantName] = useState('');
  const [accountantEmail, setAccountantEmail] = useState('');
  const [accountantPassword, setAccountantPassword] = useState(''); // Tùy chọn
  const [accountantDepartment, setAccountantDepartment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Gọi API để lưu thông tin kế toán
    console.log('Submitting Accountant Data:', {
      id: accountantId,
      name: accountantName,
      email: accountantEmail,
      password: accountantPassword, // Chỉ log nếu bạn thực sự thu thập nó
      department: accountantDepartment,
    });
    // Giả sử submit thành công
    if (onSubmitSuccess) {
      onSubmitSuccess('Accountant'); // Thông báo loại form đã submit
    }
    onClose(); // Đóng form sau khi submit
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <h2>Create New Accountant</h2>

      <div className="form-row">
        <input
          type="text"
          placeholder="Accountant ID (e.g., A001)"
          value={accountantId}
          onChange={(e) => setAccountantId(e.target.value)}
          required
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
          placeholder="Password (optional)"
          value={accountantPassword}
          onChange={(e) => setAccountantPassword(e.target.value)}
        />
      </div>

      <div className="form-row">
        <input
          type="text"
          placeholder="Department/Role (e.g., Payroll, General Ledger)"
          value={accountantDepartment}
          onChange={(e) => setAccountantDepartment(e.target.value)}
        />
      </div>
      {/* Bạn có thể thêm các trường khác nếu cần */}

      <div className="form-actions">
        <button type="submit">Create Accountant</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddAccountantForm;