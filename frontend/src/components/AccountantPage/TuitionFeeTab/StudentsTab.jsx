import React from 'react';
import './StudentsTab.css';

const mockStudentsByStatus = {
  transfer: [
    { id: 'S001', name: 'Nguyen Van A', email: 'a@example.com', fee: '2,000,000' },
  ],
  paid: [
    { id: 'S002', name: 'Tran Thi B', email: 'b@example.com', fee: '1,800,000' },
  ],
  unpaid: [
    { id: 'S003', name: 'Le Van C', email: 'c@example.com', fee: '2,100,000' }
  ]
};

const StudentsTab = ({ status }) => {
  const students = mockStudentsByStatus[status] || [];

  const handleEdit = (student) => {
    console.log('Edit:', student);
  };

  const handleDelete = (student) => {
    console.log('Delete:', student);
  };

  return (
    <div className="students-table">
      <h3 style={{ textTransform: 'capitalize' }}>
        {status} students
      </h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Tuition Fee</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((stu) => (
              <tr key={stu.id}>
                <td>{stu.id}</td>
                <td>{stu.name}</td>
                <td>{stu.email}</td>
                <td>{stu.fee}</td>
                <td>
                  <button onClick={() => handleEdit(stu)}>Edit</button>
                  <button onClick={() => handleDelete(stu)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No students found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTab;
