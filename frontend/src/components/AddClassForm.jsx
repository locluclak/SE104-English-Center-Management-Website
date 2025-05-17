import React, { useState, useEffect } from 'react';

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
    <div className="add-class-form">
      <h2>Create New Class</h2>
      <form>
        <input type="text" placeholder="ID" />
        <input type="text" placeholder="Class Name" />
        <textarea placeholder="Description" />

        <div>
          <label>Teacher</label>
          <select>
            {teachers.map((t, i) => (
              <option key={i}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Students Enrolled</label>
          {students.map((s, i) => (
            <div key={i}>
              <input type="text" placeholder="Student Name" />
              <input type="email" placeholder="Email" />
            </div>
          ))}
          <button type="button" onClick={handleAddStudent}>+ Add Student</button>
        </div>

        <input type="date" placeholder="Start Date" />
        <input type="date" placeholder="End Date" />

        <button type="submit">Submit</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default AddClassForm;
