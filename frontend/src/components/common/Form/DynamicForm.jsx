import React, { useState } from 'react';
import './DynamicForm.css';

const DynamicForm = ({ formConfig, onClose }) => {
  if (!formConfig) return <div>No form config provided</div>;

  const [formData, setFormData] = useState({});

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý thay đổi trường trong students array
  const handleStudentChange = (index, fieldName, value) => {
    const newStudents = formData.students ? [...formData.students] : [];
    newStudents[index] = { ...newStudents[index], [fieldName]: value };
    setFormData({ ...formData, students: newStudents });
  };

  const handleAddStudent = () => {
    const newStudents = formData.students ? [...formData.students] : [];
    newStudents.push({ studentId: '', name: '', email: '' });
    setFormData({ ...formData, students: newStudents });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Gửi dữ liệu backend hoặc xử lý tiếp
  };

  // Lấy 2 nhóm trường như cũ
  const twoColsFields = ['id', 'name'];
  const threeColsFields = ['teacher', 'startDate', 'endDate'];

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <h2>{formConfig.title}</h2>

      {/* Nhóm 2 cột */}
      <div className="form-row two-cols">
        {twoColsFields.map((name) => {
          const field = formConfig.fields.find(f => f.name === name);
          if (!field) return null;

          return (
            <div className="form-col" key={field.name}>
              <label>{field.label}</label>
              <input
                type={field.type || 'text'}
                placeholder={field.placeholder || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      {/* Nhóm 3 cột */}
      <div className="form-row three-cols">
        {threeColsFields.map((name) => {
          const field = formConfig.fields.find(f => f.name === name);
          if (!field) return null;

          if (field.type === 'select') {
            return (
              <div className="form-col" key={field.name}>
                <label>{field.label}</label>
                <select onChange={(e) => handleChange(field.name, e.target.value)}>
                  {field.options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div className="form-col" key={field.name}>
              <label>{field.label}</label>
              <input
                type={field.type || 'text'}
                placeholder={field.placeholder || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      {/* Phần hiển thị danh sách students dạng bảng có thể nhập */}
      <div style={{ marginTop: 20 }}>
        <label>Students Enrolled</label>
        <button type="button" onClick={handleAddStudent} style={{ marginLeft: 10 }}>
          Add Student
        </button>
        {formData.students && formData.students.length > 0 ? (
          <table border="1" cellPadding="5" style={{ marginTop: 10, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {formData.students.map((student, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      value={student.studentId}
                      onChange={(e) => handleStudentChange(idx, 'studentId', e.target.value)}
                      placeholder="ID"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => handleStudentChange(idx, 'name', e.target.value)}
                      placeholder="Student Name"
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      value={student.email}
                      onChange={(e) => handleStudentChange(idx, 'email', e.target.value)}
                      placeholder="Email"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No students added yet.</p>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: 20 }}>
        <button type="submit">{formConfig.submitLabel || 'Create'}</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default DynamicForm;
