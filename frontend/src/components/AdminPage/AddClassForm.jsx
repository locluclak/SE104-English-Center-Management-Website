import React, { useState, useEffect } from 'react';
import './AddClassForm.css'

const AddClassForm = ({ onClose }) => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([{ name: '', email: '' }]);

  // Lấy danh sách giáo viên từ DB (giả lập ở đây)
  useEffect(() => {
    // TODO: Gọi API thật từ backend
    setTeachers(['Mr. A', 'Ms. B', 'Mrs. C']);
  }, []);

  const handleAddStudent = () => {
    setStudents([...students, { name: '', email: '' }]);
  };

  return (
    <form className="form-grid">
    <h2>Create New Class</h2>

    <div className="form-row">
      <input type="text" placeholder="ID" />
      <input type="text" placeholder="Class Name" />
    </div>

    <textarea placeholder="Description" rows={3} />

    <div className="form-row">
      <div className="teacher-select">
        <label>Teacher</label>
        <select>
          {teachers.map((t, i) => (
            <option key={i}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Start Date</label>
        <input type="date" />
      </div>

      <div>
        <label>End Date</label>
        <input type="date" />
      </div>
    </div>

    <div className="students-section">
      <label>Students Enrolled</label>
      <button type="button" onClick={handleAddStudent} className="add-student-btn">
        + Add Student
      </button>
    </div>

    {students.map((s, i) => (
      <div className="form-row" key={i}>
        <input type="text" placeholder="ID" />
        <input type="text" placeholder="Student Name" />
        <input type="email" placeholder="Email" />
      </div>
    ))}

    <div className="form-actions">
      <button type="submit">Submit</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </div>
    </form>
  )}

export default AddClassForm;
