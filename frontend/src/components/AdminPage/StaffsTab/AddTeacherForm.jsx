import React, { useState, useEffect } from 'react';
import './AddStaffForm.css';

const AddTeacherForm = ({ isEditMode, initialData, onClose, onSubmitSuccess }) => {
  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherSpecialization, setTeacherSpecialization] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setTeacherId(initialData.ID || '');
      setTeacherName(initialData.NAME || '');
      setTeacherEmail(initialData.EMAIL || '');
      // Không set password vì bảo mật
      setTeacherSpecialization(initialData.SPECIALIZATION || '');
    } else {
      // Reset form nếu không edit
      setTeacherId('');
      setTeacherName('');
      setTeacherEmail('');
      setTeacherPassword('');
      setTeacherSpecialization('');
    }
  }, [isEditMode, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSubmit = {
      ID: teacherId,
      NAME: teacherName,
      EMAIL: teacherEmail,
      PASSWORD: teacherPassword, // Nếu update có thể bỏ nếu không đổi
      SPECIALIZATION: teacherSpecialization,
    };

    // TODO: gọi API cập nhật hoặc tạo mới tùy isEditMode
    console.log(isEditMode ? 'Updating teacher:' : 'Creating teacher:', dataToSubmit);

    if (onSubmitSuccess) onSubmitSuccess(dataToSubmit, isEditMode);
    onClose();
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <h2>{isEditMode ? 'Edit Teacher' : 'Create New Teacher'}</h2>

      <div className="form-row">
        <input
          type="text"
          placeholder="Teacher ID (e.g., T001)"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          required
          disabled={isEditMode} // không cho sửa ID khi edit
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
          placeholder={isEditMode ? "Leave blank to keep current password" : "Password"}
          value={teacherPassword}
          onChange={(e) => setTeacherPassword(e.target.value)}
          // Không bắt buộc nhập khi edit
          required={!isEditMode}
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
        <button type="submit">{isEditMode ? 'Update' : 'Create'}</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default AddTeacherForm;