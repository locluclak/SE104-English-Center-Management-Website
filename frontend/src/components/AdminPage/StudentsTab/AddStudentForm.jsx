// src/components/AdminPage/StudentsTab/AddStudentForm.js
import React, { useState, useEffect } from 'react';
import './AddStudentForm.css'; // Tạo file CSS này để tùy chỉnh giao diện

const AddStudentForm = ({ isEditMode, initialData, onSubmitSuccess, onClose }) => {
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    birthday: '',
    status: 'Enrolled', // Giá trị mặc định
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && initialData) {
      setStudentData({
        id: initialData.id || undefined, // Giữ lại ID nếu có để cập nhật
        name: initialData.name || '',
        email: initialData.email || '',
        birthday: initialData.birthday ? new Date(initialData.birthday).toISOString().split('T')[0] : '', // Định dạng YYYY-MM-DD cho input date
        status: initialData.status || 'Enrolled',
      });
    } else {
      // Reset form khi không ở chế độ edit hoặc không có initialData
      setStudentData({
        name: '',
        email: '',
        birthday: '',
        status: 'Enrolled',
      });
    }
  }, [isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!studentData.name.trim()) newErrors.name = "Họ tên không được để trống.";
    if (!studentData.email.trim()) {
      newErrors.email = "Email không được để trống.";
    } else if (!/\S+@\S+\.\S+/.test(studentData.email)) {
      newErrors.email = "Địa chỉ email không hợp lệ.";
    }
    if (!studentData.birthday) newErrors.birthday = "Ngày sinh không được để trống.";
    // Thêm các validation khác nếu cần

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // True nếu không có lỗi
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Chuyển đổi ngày sinh về định dạng mong muốn trước khi gửi nếu cần
      // Ví dụ: nếu API cần 'MM/DD/YYYY' và input date là 'YYYY-MM-DD'
      // const formattedData = {
      //   ...studentData,
      //   birthday: studentData.birthday ? new Date(studentData.birthday).toLocaleDateString('en-US') : ''
      // };
      onSubmitSuccess(studentData); // Gửi studentData trực tiếp
    } else {
      console.log("Form có lỗi, không thể submit.");
    }
  };

  return (
    <div className="add-student-form-container">
      <h2>{isEditMode ? 'Chỉnh sửa Thông tin Sinh viên' : 'Thêm Sinh viên Mới'}</h2>
      <form onSubmit={handleSubmit} className="student-form">
        <div className="form-group">
          <label htmlFor="name">Họ và Tên:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={studentData.name}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={studentData.email}
            onChange={handleChange}
            placeholder="Nhập địa chỉ email"
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="birthday">Ngày Sinh:</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={studentData.birthday}
            onChange={handleChange}
          />
          {errors.birthday && <p className="error-message">{errors.birthday}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Trạng Thái:</label>
          <select
            id="status"
            name="status"
            value={studentData.status}
            onChange={handleChange}
          >
            <option value="Enrolled">Đang học (Enrolled)</option>
            <option value="Unenroll">Đã nghỉ (Unenrolled)</option>
            <option value="Graduated">Đã tốt nghiệp (Graduated)</option>
            <option value="Dropped">Bỏ học (Dropped)</option>
            {/* Thêm các trạng thái khác nếu cần */}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Cập nhật' : 'Thêm Sinh viên'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;