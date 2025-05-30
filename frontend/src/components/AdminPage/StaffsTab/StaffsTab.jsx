import React, { useState, useEffect } from 'react';
import { fetchTeachers, fetchAccountants, updatePerson, deletePerson } from '../../../services/personService';
import './StaffsTab.css';

const StaffsTab = ({ staffType, data, onEdit, onDelete }) => {
  // data, onEdit, onDelete từ AdminPage truyền xuống

  const title = staffType === 'teachers' ? 'Teacher Management' : 'Accountant Management';

  const handleEditClick = (staff) => {
    if (onEdit) onEdit(staff);
  };

  const handleDeleteClick = (staff) => {
    if (onDelete) onDelete(staff);
  };

  if (!data || data.length === 0) {
    return (
      <div className="staffs-tab-container">
        <h2>{title}</h2>
        <p>No {staffType} found. Click the "+" button in the sidebar to add a new one.</p>
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
            <th>Birthday</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Hire Day</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((staff) => (
            <tr key={staff.ID || staff.id}>
              <td>{staff.ID || staff.id}</td>
              <td>{staff.NAME || staff.name}</td>
              <td>{staff.DATE_OF_BIRTH ? new Date(staff.DATE_OF_BIRTH).toLocaleDateString() : "N/A"}</td>
              <td>{staff.EMAIL || "N/A"}</td>
              <td>{staff.PHONE_NUMBER || "N/A"}</td>
              <td>{staff.HIRE_DAY ? new Date(staff.HIRE_DAY).toLocaleDateString() : "N/A"}</td>
              <td>
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEditClick(staff)}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteClick(staff)}
                >
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