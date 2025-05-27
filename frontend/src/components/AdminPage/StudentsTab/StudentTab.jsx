import React, { useState, useEffect } from 'react';
import { fetchStudents, updateStudent, deleteStudent } from '../../../services/studentService';
import StudentListFull from './StudentListFull';
import './StudentTab.css';

const StudentTab = ({ selectedStatus }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sinh viên "${student.name}" không?`)) return;
    try {
      await deleteStudent(student.id);
      setStudents(prev => prev.filter(s => s.id !== student.id));
    } catch (err) {
      alert('Xóa sinh viên thất bại: ' + err.message);
    }
  };

  const handleEditStudent = (student) => {
    alert(`Chức năng sửa sinh viên "${student.name}" chưa được triển khai.`);
  };

  // Lọc sinh viên theo trạng thái
  let studentsToDisplay = students; // MẶC ĐỊNH SẼ LÀ TẤT CẢ SINH VIÊN ĐÃ TẢI
  if (selectedStatus && selectedStatus !== "AllStudents") {
    if (selectedStatus === "View All") {
      // Logic này hiện tại đang lọc sinh viên có status là "Enrolled" hoặc "Unenroll".
      // Nếu "View All" có nghĩa là TẤT CẢ sinh viên KHÔNG PHẢI "AllStudents" thì giữ nguyên.
      // Nếu "View All" cũng có nghĩa là "tất cả các sinh viên" thì logic này cần được xem xét lại.
      // Dựa trên cách bạn đặt tên, có vẻ "View All" là một trạng thái cụ thể khác với "AllStudents".
      studentsToDisplay = students.filter(s => s.status === "Enrolled" || s.status === "Unenroll");
    } else {
      studentsToDisplay = students.filter(s => s.status === selectedStatus);
    }
  }
  // Nếu selectedStatus là "AllStudents" hoặc không được truyền vào,
  // thì studentsToDisplay vẫn giữ nguyên là 'students' (tất cả dữ liệu đã fetch).
  // Điều này đã đáp ứng yêu cầu "hiển thị all học viên trước".

  if (loading) {
    return (
      <div className="student-tab-container">
        <h2>Quản lý Sinh viên</h2>
        <p>Đang tải dữ liệu sinh viên...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-tab-container">
        <h2>Quản lý Sinh viên</h2>
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  if (!studentsToDisplay.length) {
    let message = `Không tìm thấy sinh viên nào.`;
    // Chỉ thay đổi thông báo nếu có lọc cụ thể
    if (selectedStatus && selectedStatus !== "AllStudents" && selectedStatus !== "View All") { // Thêm điều kiện này để không hiển thị "Không có sinh viên nào với trạng thái AllStudents"
      message = `Không có sinh viên nào với trạng thái "${selectedStatus}".`;
    } else if (selectedStatus === "View All") {
      message = `Không có sinh viên nào với trạng thái "Enrolled" hoặc "Unenroll".`;
    }
    return (
      <div className="student-tab-container">
        <h2>Quản lý Sinh viên {selectedStatus && selectedStatus !== "AllStudents" ? `(${selectedStatus})` : ''}</h2>
        <p>{message} Nhấn nút "+" ở sidebar để thêm mới hoặc chọn bộ lọc khác.</p>
      </div>
    );
  }

  return (
    <div className="student-tab-container">
      <h2>Quản lý Sinh viên {selectedStatus && selectedStatus !== "AllStudents" ? `(${selectedStatus})` : ''}</h2>
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
          {studentsToDisplay.map(student => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.birthday || 'N/A'}</td>
              <td>{student.email}</td>
              <td>{student.status || 'N/A'}</td> {/* Đảm bảo backend trả về 'status' */}
              <td>
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEditStudent(student)}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteStudent(student)}
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