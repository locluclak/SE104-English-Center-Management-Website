import React, { useState } from 'react';
import AssignmentForm from './AssignmentForm';
import './AssignmentList.css'

const assignmentsData = [
  {
    id: 1,
    name: 'Bài 1',
    startDate: '02/06/2025',
    endDate: '05/06/2025',
    submissions: [
      { studentName: 'Nguyen Van A', score: 9 },
      { studentName: 'Tran Thi B', score: null },
    ]
  },
];

const AssignmentList = () => {
  const [assignments, setAssignments] = useState(assignmentsData);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const handleClickAssignment = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleAddAssignment = (doc) => {
    if (editingAssignment) {
      // Edit mode: cập nhật bài cũ
      const updated = assignments.map(item =>
        item.id === editingAssignment.id ? { ...item, ...doc } : item
      );
      setAssignments(updated);
      setEditingAssignment(null);
    } else {
      // Add mode: thêm mới
      setAssignments([...assignments, {
        id: assignments.length + 1,
        submissions: [],
        ...doc,
      }]);
    }
    setShowForm(false);
  };
  

  return (
    <div>
      <button onClick={() => setShowForm(true)}>+ Thêm bài tập</button>

      {showForm && (
        <AssignmentForm
          onSubmit={handleAddAssignment}
          initialData={editingAssignment}
        />
      )}

      <table className="custom-table">
        <thead>
          <tr>
            <th>NO.</th>
            <th>Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((doc, idx) => (
            <tr key={doc.id} onClick={() => handleClickAssignment(doc)} style={{cursor: 'pointer'}}>
              <td>{idx + 1}</td>
              <td>{doc.name}</td>
              <td>{doc.startDate}</td>
              <td>{doc.endDate}</td>
              <td>
              <button onClick={() => {
                setEditingAssignment(doc);
                setShowForm(true);
              }}>
                Edit
              </button>

              <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedAssignment && (
        <div className="assignment-detail">
          <h4>Detail: {selectedAssignment.name}</h4>
          <p><strong>Submissions:</strong></p>
          <ul>
            {selectedAssignment.submissions.filter(s => s.score !== null).map((s, idx) => (
              <li key={idx}>{s.studentName} - Score: {s.score}</li>
            ))}
          </ul>
          <p><strong>Unfinished:</strong></p>
          <ul>
            {selectedAssignment.submissions.filter(s => s.score === null).map((s, idx) => (
              <li key={idx}>{s.studentName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
