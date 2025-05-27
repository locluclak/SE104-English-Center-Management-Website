import React from 'react';

const StudentTable = () => {
  const students = [
    { id: 'S01', name: 'Nguyen Van A', email: 'a@example.com' },
    { id: 'S02', name: 'Tran Thi B', email: 'b@example.com' },
  ];

  return (
    <table className="custom-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Họ tên</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {students.map(student => (
          <tr key={student.id}>
            <td>{student.id}</td>
            <td>{student.name}</td>
            <td>{student.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentTable;
