import React from 'react';
import './StudentTab.css'; // Tạo file CSS này để style, hoặc dùng chung CSS nếu phù hợp

const StudentTab = ({ students, onEditStudent, onDeleteStudent, selectedStatus }) => {
  const title = 'Quản lý Sinh viên';

  // 1. Xử lý trường hợp không có sinh viên nào ban đầu
  if (!students || students.length === 0) {
    return (
      <div className="student-tab-container">
        <h2>{title}</h2>
        <p>Hiện tại không có sinh viên nào trong hệ thống. Nhấn nút "+" ở sidebar để thêm mới.</p>
      </div>
    );
  }

  // 2. Lọc sinh viên dựa trên selectedStatus
  let studentsToDisplay = students;

  if (selectedStatus && selectedStatus !== "AllStudents") {
    if (selectedStatus === "View All") {
      // Hiển thị cả Enrolled và Unenroll khi chọn View All
      studentsToDisplay = students.filter(student =>
        student.status === "Enrolled" || student.status === "Unenroll"
      );
    } else {
      // Lọc theo trạng thái cụ thể khác
      studentsToDisplay = students.filter(student => student.status === selectedStatus);
    }
  }

  // 3. Xử lý trường hợp sau khi lọc không có sinh viên nào phù hợp
  if (studentsToDisplay.length === 0) {
    let message = `Không tìm thấy sinh viên nào.`;
    if (selectedStatus && selectedStatus !== "AllStudents") {
      message = `Không có sinh viên nào với trạng thái "${selectedStatus}".`;
    }
    return (
      <div className="student-tab-container">
        <h2>{title}</h2>
        <p>{message} Nhấn nút "+" ở sidebar để thêm mới hoặc chọn bộ lọc khác.</p>
      </div>
    );
  }

  // 4. Hiển thị bảng với danh sách sinh viên đã lọc (hoặc toàn bộ)
  return (
    <div className="student-tab-container">
      <h2>{title} {selectedStatus && selectedStatus !== "AllStudents" ? `(${selectedStatus})` : ''}</h2>
      <table className="student-table"> {/* Bạn có thể dùng class chung "data-table" */}
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ và Tên</th>
            <th>Ngày Sinh</th>
            <th>Email</th>
            <th>Trạng Thái</th> {/* Thêm cột Trạng Thái */}
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {studentsToDisplay.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.birthday || 'N/A'}</td>
              <td>{student.email}</td>
              <td>{student.status || 'N/A'}</td> {/* Hiển thị trạng thái */}
              <td>
                <button
                  className="action-btn edit-btn"
                  onClick={() => onEditStudent(student)} // Truyền toàn bộ object student
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => onDeleteStudent(student)} // Truyền toàn bộ object student
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