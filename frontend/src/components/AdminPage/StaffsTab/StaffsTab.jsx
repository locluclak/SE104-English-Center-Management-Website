import React, { useState, useEffect } from 'react';
import { fetchTeachers, fetchAccountants, updatePerson, deletePerson } from '../../../services/personService';
import './StaffsTab.css';

const StaffsTab = ({ staffType }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const title = staffType === 'teachers' ? 'Teacher Management' : 'Accountant Management';

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

        console.log('Data fetched:', data); // <-- check dữ liệu ở đây


        // Map backend keys (chữ hoa) sang camelCase
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
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, [staffType]);

  const handleEdit = (staff) => {
    const newName = window.prompt('Enter new name:', staff.name);
    if (!newName || newName.trim() === '' || newName === staff.name) return;

    updatePerson(staff.id, { name: newName.trim() })
      .then(() => {
        setStaffList(prev =>
          prev.map(s => (s.id === staff.id ? { ...s, name: newName.trim() } : s))
        );
        alert('Updated successfully');
      })
      .catch(err => alert('Update failed: ' + err.message));
  };

  const handleDelete = (staff) => {
    if (!window.confirm(`Are you sure you want to delete ${staff.name}?`)) return;

    deletePerson(staff.id)
      .then(() => {
        setStaffList(prev => prev.filter(s => s.id !== staff.id));
        alert('Deleted successfully');
      })
      .catch(err => alert('Delete failed: ' + err.message));
  };

  if (loading) {
    return (
      <div className="staffs-tab-container">
        <h2>{title}</h2>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staffs-tab-container">
        <h2>{title}</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (staffList.length === 0) {
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
          {staffList.map(staff => (
            <tr key={staff.id}>
              <td>{staff.id}</td>
              <td>{staff.name}</td>
              <td>{staff.birthday || 'N/A'}</td>
              <td>{staff.email || 'N/A'}</td>
              <td>{staff.phoneNumber || 'N/A'}</td>
              <td>{staff.hireDay || 'N/A'}</td>
              <td>
                <button className="action-btn edit-btn" onClick={() => handleEdit(staff)}>
                  Edit
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(staff)}>
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