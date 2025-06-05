import React, { useState } from 'react';
import Table from '../Table/Table';

const studentEnrollColumns = (onDelete) => [
  { header: 'ID', accessor: 'studentId' },
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  {
    header: 'Action',
    render: (row) => (
      <button 
        onClick={() => onDelete(row.studentId)} 
        style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        x
      </button>
    ),
  },
];

const DynamicListField = ({ field, value = [], onChange, onSave }) => {
  const handleChange = (idx, key, newValue) => {
    const updated = [...value];
    updated[idx] = { ...updated[idx], [key]: newValue };
    onChange(updated);
  };

  const addRow = (student) => {
    // Thêm sinh viên vào danh sách
    onChange([...value, student]);
  };

  const removeRow = (idx) => {
    // Xóa sinh viên khỏi danh sách
    onChange(value.filter((_, i) => i !== idx));
  };

const handleRemoveStudent = async (studentId) => {
  try {
    // Call your API to remove the student from the course
    await removeStudentFromCourse(studentId, clsId);
    alert('Student removed successfully');
  } catch (error) {
    console.error('Error removing student:', error);
    alert('Failed to remove student');
  }
};


  const handleSave = async () => {
    try {
      // Gọi API để cập nhật danh sách sinh viên trong khóa học
      await onSave(value);
      alert('Danh sách sinh viên đã được cập nhật');
    } catch (err) {
      console.error('Lỗi khi lưu danh sách:', err);
      alert('Không thể lưu danh sách sinh viên');
    }
  };

  return (
    <div className="form-row">
      <label>{field.label}</label>
      <div>
        {value.map((entry, idx) => (
          <div className="dynamic-list-row" key={idx}>
            <span>{entry.name}</span>
            <button type="button" onClick={() => removeRow(idx)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Hiển thị danh sách sinh viên đã chọn */}
      <div style={{ marginTop: '20px' }}>
        <h4>Danh sách học viên đã chọn</h4>
        <Table
          columns={studentEnrollColumns(handleDelete)}
          data={value}
        />
      </div>

      {/* Nút Save để lưu danh sách sinh viên */}
      <button type="button" onClick={handleSave}>Save</button>
    </div>
  );
};

export default DynamicListField;
