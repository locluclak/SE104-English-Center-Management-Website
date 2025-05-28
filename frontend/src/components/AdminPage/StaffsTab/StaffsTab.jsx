import React, { useState, useEffect } from 'react';
import { fetchTeachers, fetchAccountants, updatePerson, deletePerson } from '../../../services/personService';
import './StaffsTab.css';

const StaffsTab = ({ staffType, onEdit, onDelete }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStaff = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        if (staffType === 'teachers') {
          data = await fetchTeachers();
        } else if (staffType === 'accountants') {
          data = await fetchAccountants();
        }

        // Map dữ liệu từ backend (chữ hoa) sang camelCase
        const mappedData = data.map(item => ({
          id: item.ID,
          name: item.NAME,
          birthday: item.DATE_OF_BIRTH,
          email: item.EMAIL,
          phoneNumber: item.PHONE_NUMBER,
          hireDay: item.HIRE_DAY,
        }));

        setStaffList(mappedData);
      } catch (err) {
        setError(err.message || 'Failed to load staff data');
        setStaffList([]);
      } finally {
        setLoading(false);
      }
    };

    if (staffType === 'teachers' || staffType === 'accountants') {
      loadStaff();
    } else {
      setStaffList([]);
      setLoading(false);
    }
  }, [staffType]);

  if (loading) {
    return (
      <div className="staffs-tab-container">
        <h2>{staffType === 'teachers' ? 'Teacher Management' : 'Accountant Management'}</h2>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staffs-tab-container">
        <h2>{staffType === 'teachers' ? 'Teacher Management' : 'Accountant Management'}</h2>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  if (!staffList.length) {
    return (
      <div className="staffs-tab-container">
        <h2>{staffType === 'teachers' ? 'Teacher Management' : 'Accountant Management'}</h2>
        <p>No {staffType} found. Click the "+" button in the sidebar to add a new one.</p>
      </div>
    );
  }

  return (
    <div className="staffs-tab-container">
      <h2>{staffType === 'teachers' ? 'Teacher Management' : 'Accountant Management'}</h2>
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
          {staffList.map((staff) => (
            <tr key={staff.id}>
              <td>{staff.id}</td>
              <td>{staff.name}</td>
              <td>{staff.birthday ? new Date(staff.birthday).toLocaleDateString() : 'N/A'}</td>
              <td>{staff.email || 'N/A'}</td>
              <td>{staff.phoneNumber || 'N/A'}</td>
              <td>{staff.hireDay ? new Date(staff.hireDay).toLocaleDateString() : 'N/A'}</td>
              <td>
                <button className="action-btn edit-btn" onClick={() => onEdit(staff)}>Edit</button>
                <button className="action-btn delete-btn" onClick={() => onDelete(staff)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffsTab;