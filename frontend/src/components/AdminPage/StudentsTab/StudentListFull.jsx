import React from 'react';

const StudentListFull = ({ students }) => {
  return (
    <div className="student-table-container">
        <h2>All Students</h2>
        {students.length === 0 ? (
        <p>No student data available.</p>
        ) : (
        <table className="student-table">
            <thead>
            <tr>
                <th>NO.</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Status</th>
            </tr>
            </thead>
            <tbody>
            {students.map((student, index) => (
                <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.password}</td>
                <td>{student.status}</td>
                </tr>
            ))}
            </tbody>
        </table>
        )}
    </div>
  );
};

export default StudentListFull;
