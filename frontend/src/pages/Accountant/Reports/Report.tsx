import React, { useState, useEffect } from "react";
import { MainApiRequest } from "@/services/MainApiRequest"; // Import MainApiRequest trực tiếp để gọi API
import { Table, Modal, Button, Select, message, Tabs } from "antd";
import "./Report.scss";

// Interface cho báo cáo theo lớp học
interface Student {
  student_name: string;
  student_email: string;
  payment_price: number; // Changed to number as it's formatted as currency
  payment_type: string;
  payment_status: string;
  payment_date: string | null;
}

interface ClassReport {
  courseId: string; // Add courseId based on screenshot
  totalRevenue: number;
  students: Student[];
}

// Interface cho báo cáo theo thời gian
// Assuming this interface covers both 'courses' and 'students' grouping,
// with different key names for each, or the backend sends consistent keys.
// For 'courses' group: course_id, course_name, total_revenue
// For 'students' group: student_id, student_name, student_email, total_paid
interface TimeReportCourse {
  course_id: string;
  course_name: string;
  total_revenue: number;
}

interface TimeReportStudent {
  student_id: string;
  student_name: string;
  student_email: string;
  total_paid: number; // Sum of payments by student
}

interface TimeReportResponse {
  report: TimeReportCourse[] | TimeReportStudent[]; // Can be either depending on groupBy
  overallRevenue: number;
}


const Reports = () => {
  const [selectedTab, setSelectedTab] = useState("time"); // Default to 'time' tab
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [groupBy, setGroupBy] = useState("courses"); // Default group by courses
  const [courseId, setCourseId] = useState<string | null>(""); // For course selection
  // Use 'any' temporarily for 'report' state to handle different structures gracefully,
  // or define a more complex union type for report if strict typing is preferred.
  const [report, setReport] = useState<any[]>([]); // Dữ liệu báo cáo
  const [overallRevenue, setOverallRevenue] = useState(0);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal state

  // Fetch danh sách khóa học trực tiếp từ backend qua API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await MainApiRequest.get("/course/all"); // Lấy danh sách khóa học từ backend
        // Assuming response.data is an array of course objects, e.g., [{ COURSE_ID: "...", NAME: "..." }]
        setAvailableCourses(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách lớp học:", error);
        message.error("Không thể tải danh sách lớp học.");
      }
    };
    fetchCourses();
  }, []);

  const handleViewReport = async () => {
    if (selectedTab === "time") {
      if (!startTime || !endTime) {
        message.error("Vui lòng chọn khoảng thời gian hợp lệ.");
        return;
      }

      try {
        const response = await MainApiRequest.get( // Nhận toàn bộ Axios response
          "/payment/revenue-report-bytime",
          {
            params: {
              startTime,
              endTime,
              groupBy,
            },
          }
        );

        console.log("Time Report Full Axios Response:", response); // Để kiểm tra toàn bộ cấu trúc
        const apiData: TimeReportResponse = response.data; // Lấy payload dữ liệu thực sự

        // Kiểm tra xem dữ liệu trả về có hợp lệ không
        if (apiData?.report?.length > 0) { // Truy cập qua apiData
          setReport(apiData.report);
          setOverallRevenue(apiData.overallRevenue);
        } else {
          setReport([]); // Đảm bảo truyền mảng rỗng nếu không có dữ liệu
          setOverallRevenue(0); // Reset overall revenue if no data
          message.warning("Không có dữ liệu báo cáo cho thời gian đã chọn.");
        }
      } catch (err) {
        console.error("Error fetching revenue data", err);
        message.error("Không thể tải báo cáo doanh thu.");
      }
    } else if (selectedTab === "course") {
      if (!courseId) {
        message.error("Vui lòng chọn lớp học.");
        return;
      }

      try {
        const response = await MainApiRequest.get( // Nhận toàn bộ Axios response
          `/payment/revenue-report/${courseId}`
        );
        console.log("Course Report Full Axios Response:", response); // Để kiểm tra toàn bộ cấu trúc
        const apiData: ClassReport = response.data; // Lấy payload dữ liệu thực sự

        // Kiểm tra xem dữ liệu trả về có hợp lệ không
        if (apiData?.students?.length > 0) { // Truy cập qua apiData
          setReport(apiData.students); // Chỉ truyền apiData.students vào bảng
          setOverallRevenue(apiData.totalRevenue);
        } else {
          setReport([]); // Đảm bảo truyền mảng rỗng nếu không có dữ liệu
          setOverallRevenue(0); // Reset overall revenue if no data
          message.warning("Không có dữ liệu báo cáo cho lớp học đã chọn.");
        }
      } catch (err) {
        console.error("Error fetching course report data", err);
        message.error("Không thể tải báo cáo theo lớp học.");
      }
    }
  };

  const handleExportCSV = async () => {
  if (selectedTab === "time") {
    if (!startTime || !endTime) {
      message.error("Vui lòng chọn khoảng thời gian hợp lệ.");
      return;
    }
    try {
      const response = await MainApiRequest.get(
        "/payment/revenue-report-bytime",
        {
          params: { startTime, endTime, groupBy },
          responseType: "blob", // Để nhận dữ liệu file
        }
      );

      // Tạo URL và tải file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `revenue_report_${startTime}_${endTime}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the element after download
      window.URL.revokeObjectURL(url); // Release the URL object
    } catch (error) {
      console.error("Error exporting revenue report", error);
      message.error("Không thể xuất báo cáo doanh thu.");
    }
  } else if (selectedTab === "course") {
    if (!courseId) {
      message.error("Vui lòng chọn lớp học.");
      return;
    }
    try {
      const response = await MainApiRequest.get(
        `/payment/revenue-report/${courseId}/export`,
        {
          responseType: "blob", // Để nhận dữ liệu file
        }
      );

      // Tạo URL và tải file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `course_report_${courseId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the element after download
      window.URL.revokeObjectURL(url); // Release the URL object
    } catch (error) {
      console.error("Error exporting course report", error);
      message.error("Không thể xuất báo cáo theo lớp học.");
    }
  }
};

  // Table Columns
  const getColumns = () => {
    if (selectedTab === "time") {
      if (groupBy === "courses") {
        return [
          {
            title: "ID",
            dataIndex: "course_id", // Corrected case to match TimeReport interface
            key: "course_id",
          },
          {
            title: "Lớp học",
            dataIndex: "course_name", // Corrected case to match TimeReport interface
            key: "course_name",
          },
          {
            title: "Doanh thu",
            dataIndex: "total_revenue", // Corrected case to match TimeReport interface
            key: "total_revenue",
            render: (value: number) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(value),
          },
        ];
      } else { // groupBy === "students"
        return [
          {
            title: "ID",
            dataIndex: "student_id", // Assuming camelCase from backend
            key: "student_id",
          },
          {
            title: "Tên học viên",
            dataIndex: "student_name", // Assuming camelCase from backend
            key: "student_name",
          },
          {
            title: "Email",
            dataIndex: "student_email", // Assuming camelCase from backend
            key: "student_email",
          },
          {
            title: "Số tiền đã trả",
            dataIndex: "total_paid", // Assuming camelCase from backend
            key: "total_paid",
            render: (value: number) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(value),
          },
        ];
      }
    } else if (selectedTab === "course") {
      return [
        {
          title: "Tên",
          dataIndex: "student_name",
          key: "student_name",
        },
        {
          title: "Email",
          dataIndex: "student_email",
          key: "student_email",
        },
        {
          title: "Giá",
          dataIndex: "payment_price",
          key: "payment_price",
          render: (value: number) =>
            new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value),
        },
        {
          title: "Loại",
          dataIndex: "payment_type",
          key: "payment_type",
        },
        {
          title: "Trạng thái",
          dataIndex: "payment_status",
          key: "payment_status",
        },
        {
          title: "Ngày thanh toán",
          dataIndex: "payment_date",
          key: "payment_date",
          render: (value: string | null) =>
            value ? new Date(value).toLocaleString("vi-VN") : "-",
        },
      ];
    }
    return [];
  };

  const items = [
    {
      key: "time",
      label: "Báo cáo theo thời gian",
      children: (
        <div className="report-controls-row">
          <div className="control-group">
            <label htmlFor="start-date">Từ:</label>
            <input
              id="start-date"
              type="date"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label htmlFor="end-date">Đến:</label>
            <input
              id="end-date"
              type="date"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label htmlFor="group-by">Nhóm theo:</label>
            <select
              id="group-by"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="courses">Theo lớp học</option>
              <option value="students">Theo học viên</option>
            </select>
          </div>
          <div className="control-group">
            <button className="view-button" onClick={handleViewReport}>
              Xem báo cáo
            </button>
          </div>
          <div className="control-group">
            <button className="export-button" onClick={handleExportCSV}>
              Xuất CSV
            </button>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Báo cáo theo lớp học",
      children: (
        <div className="report-controls-row">
          <div className="control-group">
            <label htmlFor="course-id">Chọn lớp:</label>
            <select
              id="course-id"
              value={courseId || ""}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">-- Chọn lớp học --</option>
              {availableCourses.map((course) => (
                <option key={course.COURSE_ID} value={course.COURSE_ID}>
                  {course.NAME}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <button className="view-button" onClick={handleViewReport}>
              Xem báo cáo
            </button>
          </div>
          <div className="control-group">
            <button className="export-button" onClick={handleExportCSV}>
              Xuất CSV
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="reports-container">
      <h3 className="report-title">REVENUE REPORT</h3>
      <Tabs items={items} activeKey={selectedTab} onChange={setSelectedTab} />
      {report.length > 0 && (
        <div className="table-container">
          <Table
            columns={getColumns()}
            dataSource={report.map((item: any, index: number) => ({
              ...item,
              key: item.course_id || item.student_id || item.student_name + index || index,
            }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} bản ghi`,
            }}
          />
          <p className="total-revenue">
            <strong>Tổng doanh thu:</strong>{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(overallRevenue)}
          </p>
        </div>
      )}

      {/* Modal to show report details - currently generic */}
      <Modal
        title="REPORT DETAILS"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <p>Chi tiết báo cáo sẽ được hiển thị ở đây.</p>
        <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>
      </Modal>
    </div>
  );
};

export default Reports;