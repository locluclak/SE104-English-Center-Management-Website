import React, { useState } from 'react';
import './AddStaffForm.css';

const AddTeacherForm = ({ onClose, onSubmitSuccess }) => {
  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState(''); // Tùy chọn
  const [teacherSpecialization, setTeacherSpecialization] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Gọi API để lưu thông tin giáo viên
    console.log('Submitting Teacher Data:', {
      id: teacherId,
      name: teacherName,
      email: teacherEmail,
      password: teacherPassword, // Chỉ log nếu bạn thực sự thu thập nó
      specialization: teacherSpecialization,
    });
    // Giả sử submit thành công
    if (onSubmitSuccess) {
      onSubmitSuccess('Teacher'); // Thông báo loại form đã submit
    }
    onClose(); // Đóng form sau khi submit
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <h2>Create New Teacher</h2>

      <div className="form-row">
        <input
          type="text"
          placeholder="Teacher ID (e.g., T001)"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <input
          type="email"
          placeholder="Email Address"
          value={teacherEmail}
          onChange={(e) => setTeacherEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (optional)"
          value={teacherPassword}
          onChange={(e) => setTeacherPassword(e.target.value)}
        />
      </div>

      <div className="form-row">
        <input
          type="text"
          placeholder="Specialization (e.g., English, Math)"
          value={teacherSpecialization}
          onChange={(e) => setTeacherSpecialization(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="submit">Create Teacher</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddTeacherForm;