import React, { useState, useEffect } from "react";
import { fetchStudents, deletePerson } from "../../../services/personService";
import "./StudentTab.css";

const StudentTab = ({ selectedStatus, onEditStudent, onDeleteStudent }) => {
  const [studentsList, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const title = "Quản lý Sinh viên";

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const data = await fetchStudents();

        const mappedData = data.map((student) => ({
          id: student.ID,
          name: student.NAME,
          birthday: student.DATE_OF_BIRTH,
          email: student.EMAIL,
          phoneNumber: student.PHONE_NUMBER,
          enrollDate: student.ENROLL_DATE,
          status: student.STATUS || "Enrolled",
        }));

        setStudents(mappedData);
        setError(null);
      } catch (err) {
        setError(err.message || "Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleEditClick = (student) => {
    if (onEditStudent) onEditStudent(student);
  };

  const handleDeleteClick = (student) => {
    if (onDeleteStudent) onDeleteStudent(student);
  };

  let studentsToDisplay = studentsList;
  if (
    selectedStatus &&
    selectedStatus !== "AllStudents" &&
    selectedStatus.toLowerCase() !== "all"
  ) {
    if (selectedStatus === "View All") {
      studentsToDisplay = studentsList.filter(
        (student) => student.status === "Enrolled" || student.status === "Unenroll"
      );
    } else {
      studentsToDisplay = studentsList.filter(
        (student) => student.status === selectedStatus
      );
    }
  }

  if (loading) {
    return (
      <div className="staffs-tab-container">
        <h2>{title}</h2>
        <p>Đang tải dữ liệu sinh viên...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staffs-tab-container">
        <h2>{title}</h2>
        <p style={{ color: "red" }}>Lỗi: {error}</p>
      </div>
    );
  }

  if (studentsList.length === 0) {
    return (
      <div className="staffs-tab-container">
        <h2>{title}</h2>
        <p>Hiện tại không có sinh viên nào trong hệ thống. Nhấn nút "+" để thêm mới.</p>
      </div>
    );
  }

  if (studentsToDisplay.length === 0) {
    return (
      <div className="staffs-tab-container">
        <h2>{title}</h2>
        <p>Không có sinh viên nào với trạng thái "{selectedStatus}". Nhấn nút "+" để thêm mới hoặc chọn bộ lọc khác.</p>
      </div>
    );
  }

  return (
    <div className="staffs-tab-container">
      <h2>{title} {selectedStatus && selectedStatus !== "AllStudents" ? `(${selectedStatus})` : ""}</h2>
      <table className="staff-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Birthday</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {studentsToDisplay.map(student => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.birthday ? new Date(student.birthday).toLocaleDateString() : "N/A"}</td>
              <td>{student.email || "N/A"}</td>
              <td>{student.phoneNumber || "N/A"}</td>
              <td>{student.status || "N/A"}</td>
              <td>
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEditClick(student)}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteClick(student)}
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

export default StudentTab;