// TeacherStudentItem.tsx
import React, { useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, message } from "antd";
import moment from "moment";
import { MainApiRequest } from "@/services/MainApiRequest";
import { Users } from "../../components/Ui/Icons/icons";

interface BackendStudent { // Giữ nguyên BackendStudent để map từ API
  ID: string
  NAME: string
  EMAIL: string
  PHONE_NUMBER: string
  DATE_OF_BIRTH: string
  ENROLL_DATE: string
  PAYMENT_STATUS?: "UNPAID" | "PAID" | "DEFERRED"
}

interface StudentForTable { // Interface riêng cho dữ liệu hiển thị trong Table
  key: string; // key cho Ant Design Table
  id: string;
  name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  birthday: string; // Dạng đã format
  status: string;
}

interface TeacherStudentItemProps {
  courseId: string;
  searchTerm: string; // Thêm searchTerm vào props
}

const formatDate = (dateString: string): string =>
  dateString ? moment(dateString).format("YYYY-MM-DD") : "";

const TeacherStudentItem: React.FC<TeacherStudentItemProps> = ({ courseId, searchTerm }) => {
  const [students, setStudents] = useState<StudentForTable[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Endpoint API bạn đã dùng trong TeacherCourseDetail.tsx là `/course/${courseId}/students`
      const res = await MainApiRequest.get<BackendStudent[]>(`/course/${courseId}/students`);
      const fetchedStudents: StudentForTable[] = res.data.map((s: BackendStudent) => ({
        key: s.ID, // Dùng ID làm key
        id: s.ID,
        name: s.NAME,
        email: s.EMAIL,
        phone_number: s.PHONE_NUMBER ?? "",
        date_of_birth: s.DATE_OF_BIRTH,
        birthday: formatDate(s.DATE_OF_BIRTH),
        status: s.PAYMENT_STATUS ?? "active", // Giả định PAYMENT_STATUS có thể làm status
      }));
      setStudents(fetchedStudents);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách học viên:", err);
      message.error("Không thể lấy danh sách học viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]); // Fetch lại khi courseId thay đổi

  // Lọc sinh viên dựa trên searchTerm
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );


  return (
    <Table
      dataSource={filteredStudents} // Sử dụng filteredStudents
      rowKey="id"
      pagination={{ pageSize: 5, showSizeChanger: true }}
      loading={loading}
      columns={[
        { title: "ID", dataIndex: "id" },
        { title: "Name", dataIndex: "name" },
        { title: "Email", dataIndex: "email" },
        { title: "Phone Number", dataIndex: "phone_number" },
        {
          title: "Date of Birth",
          dataIndex: "birthday",
          render: (text) => moment(text).format("DD-MM-YYYY"),
        },
      ]}
    />
  );
};

export default TeacherStudentItem;