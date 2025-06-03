import React from 'react';
import Table from '../Table/Table';

const studentEnrollColumns = (onDelete) => [
  { header: 'ID', accessor: 'studentId' },
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  {
    header: 'Action',
    render: (row) => (
      <button onClick={() => onDelete(row.studentId)}>Remove</button>
    ),
  },
];

const DynamicListField = ({ field, value = [], onChange }) => {
  const handleChange = (idx, key, newValue) => {
    const updated = [...value];
    updated[idx] = { ...updated[idx], [key]: newValue };
    onChange(updated);
  };

  const addRow = () => {
    onChange([...value, {}]);
  };

  const removeRow = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  // Hàm xóa theo studentId (cũng có thể xóa theo index nếu muốn)
  const handleDelete = (studentId) => {
    onChange(value.filter(student => student.studentId !== studentId));
  };

  return (
    <div className="form-row">
      <label>{field.label}</label>
      {value.map((entry, idx) => (
        <div className="dynamic-list-row" key={idx}>
          {field.fields.map((subField, subIdx) => (
            <input
              key={subIdx}
              type={subField.type}
              placeholder={subField.placeholder}
              value={entry[subField.name] || ''}
              onChange={(e) => handleChange(idx, subField.name, e.target.value)}
            />
          ))}
          <button type="button" onClick={() => removeRow(idx)}>Remove</button>
        </div>
      ))}

      {/* Bảng hiển thị dưới nút Add Student */}
      <div style={{ marginTop: '20px' }}>
        <h4>Danh sách học viên đã đăng ký</h4>
        <Table
          columns={studentEnrollColumns(handleDelete)}
          data={value}
        />
      </div>
    </div>
  );
};

export default DynamicListField;
