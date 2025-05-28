import React, { useState, useEffect } from "react";
import { fetchStudents, updatePerson, deletePerson } from "../../../services/personService";
import "./StudentTab.css";

const StudentTab = ({ selectedStatus, onEditStudent, onDeleteStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const title = "Quản lý Sinh viên";

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const data = await fetchStudents();

        // Map dữ liệu backend sang chuẩn frontend
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

  // Gọi callback sửa nếu có
  const handleEdit = (student) => {
    if (onEditStudent) onEditStudent(student);
  };

  // Xóa student, gọi API deletePerson
  const handleDelete = async (student) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa sinh viên ${student.name}?`)) return;

    try {
      await deletePerson(student.id);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      if (onDeleteStudent) onDeleteStudent(student);
    } catch (err) {
      alert("Lỗi xóa sinh viên: " + err.message);
    }
  };

  // Lọc theo selectedStatus
  let studentsToDisplay = students;
  if (
    selectedStatus &&
    selectedStatus !== "AllStudents" &&
    selectedStatus.toLowerCase() !== "all"
  ) {
    if (selectedStatus === "View All") {
      studentsToDisplay = students.filter(
        (student) => student.status === "Enrolled" || student.status === "Unenroll"
      );
    } else {
      studentsToDisplay = students.filter(
        (student) => student.status === selectedStatus
      );
    }
  }

  if (loading) {
    return (
      <div className="student-tab-container">
        <h2>{title}</h2>
        <p>Đang tải dữ liệu sinh viên...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-tab-container">
        <h2>{title}</h2>
        <p style={{ color: "red" }}>Lỗi: {error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="student-tab-container">
        <h2>{title}</h2>
        <p>
          Hiện tại không có sinh viên nào trong hệ thống. Nhấn nút "+" ở sidebar để thêm mới.
        </p>
      </div>
    );
  }

  if (studentsToDisplay.length === 0) {
    return (
      <div className="student-tab-container">
        <h2>{title}</h2>
        <p>
          Không có sinh viên nào với trạng thái "{selectedStatus}". Nhấn nút "+" ở sidebar để
          thêm mới hoặc chọn bộ lọc khác.
        </p>
      </div>
    );
  }

  return (
    <div className="student-tab-container">
      <h2>
        {title} {selectedStatus && selectedStatus !== "AllStudents" ? `(${selectedStatus})` : ""}
      </h2>
      <table className="student-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ và Tên</th>
            <th>Ngày Sinh</th>
            <th>Email</th>
            <th>Trạng Thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {studentsToDisplay.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.birthday || "N/A"}</td>
              <td>{student.email || "N/A"}</td>
              <td>{student.status || "N/A"}</td>
              <td>
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(student)}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(student)}
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