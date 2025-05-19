// StaffsTab.js
import React from 'react';
import './StaffsTab.css'; // Tạo file CSS này để style

const StaffsTab = ({ staffType, data, onEdit, onDelete }) => {
  const title = staffType === 'teachers' ? 'Teacher Management' : 'Accountant Management';
  const staffRole = staffType === 'teachers' ? 'Teacher' : 'Accountant';

  if (!data || data.length === 0) {
    return (
      <div className="staffs-tab-container">
        <h2>{title}</h2>
        <p>No {staffRole.toLowerCase()}s found. Click the "+" button in the sidebar to add a new one.</p>
      </div>
    );
  }

  return (
    <div className="staffs-tab-container">
      <h2>{title}</h2>
      <table className="staff-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            {staffType === 'teachers' && <th>Specialization</th>}
            {staffType === 'accountants' && <th>Department</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((staffMember) => (
            <tr key={staffMember.id}>
              <td>{staffMember.id}</td>
              <td>{staffMember.name}</td>
              <td>{staffMember.email}</td>
              {staffType === 'teachers' && <td>{staffMember.specialization || 'N/A'}</td>}
              {staffType === 'accountants' && <td>{staffMember.department || 'N/A'}</td>}
              <td>
                <button className="action-btn edit-btn" onClick={() => onEdit(staffMember.id, staffType)}>
                  Edit
                </button>
                <button className="action-btn delete-btn" onClick={() => onDelete(staffMember.id, staffType)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffsTab;