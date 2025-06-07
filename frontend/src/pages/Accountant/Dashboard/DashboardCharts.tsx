import React, { useEffect, useState } from "react";
import { Select, message, Form, Modal } from "antd";
import {BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,} from "recharts";
import {PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend, } from "recharts"; // Cập nhật import đúng
import {LineChart,Line,CartesianGrid as LineCartesianGrid,XAxis as LineXAxis,YAxis as LineYAxis,Tooltip as LineTooltip,Legend as LineLegend, } from "recharts"; // Cập nhật import LineChart
import { MainApiRequest } from "@/services/MainApiRequest"; // Import MainApiRequest để gọi API
import "./DashboardCharts.scss"; // Thêm style

interface Student {
  student_name: string;
  student_email: string;
  payment_price: number; // Changed to number as it's formatted as currency
  payment_type: string;
  payment_status: string;
  payment_date: string | null;
}

interface RevenueData {
  totalRevenue: number;
  students: Student[];
}

const DashboardCharts = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1); // Khoá học mặc định
  const [courses, setCourses] = useState<any[]>([]); // Danh sách khóa học
  const [revenueByCourse, setRevenueByCourse] = useState<any[]>([]); // Doanh thu của khóa học
  const [totalRevenueData, setTotalRevenueData] = useState<any[]>([]); // Dữ liệu doanh thu tổng
  const [statusSummary, setStatusSummary] = useState({ paid: 0, unpaid: 0 }); // Tỷ lệ thanh toán (đã và chưa thanh toán)

  // Fetch danh sách khoá học
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await MainApiRequest.get("/course/all"); // Sử dụng MainApiRequest để lấy danh sách khóa học
        setCourses(res.data);
      } catch (err) {
        console.error("Error loading courses data", err);
        message.error("Failed to load courses data.");
      }
    };

    fetchCourses();
  }, []);

  // Fetch doanh thu và tỷ lệ thanh toán cho khóa học khi chọn khóa học
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await MainApiRequest.get(
          `/payment/revenue-report/${selectedCourseId}`
        ); // Sử dụng MainApiRequest để lấy doanh thu
        const data: RevenueData = response.data; // Đảm bảo kiểu dữ liệu là RevenueData

        // Tính toán doanh thu và số học viên đã thanh toán và chưa thanh toán
        const paidStudents = data.students.filter(
          (student) => student.payment_status.trim().toUpperCase() === "PAID"
        ).length;
        const unpaidStudents = data.students.filter(
          (student) => student.payment_status.trim().toUpperCase() === "UNPAID"
        ).length;

        setRevenueByCourse([
          {
            course_name: `Course ${selectedCourseId}`,
            total_revenue: data.totalRevenue,
          },
        ]);

        setStatusSummary({
          paid: paidStudents,
          unpaid: unpaidStudents,
        });
      } catch (err) {
        console.error("Error fetching revenue data", err);
        message.error("Failed to load revenue data.");
      }
    };

    fetchRevenueData();
  }, [selectedCourseId]); // Khi chọn khóa học thay đổi, dữ liệu sẽ được tải lại

  // Fetch tổng doanh thu của tất cả các khóa học
  useEffect(() => {
    const fetchTotalRevenueData = async () => {
      try {
        const response = await MainApiRequest.get(
          "/payment/revenue-report-bytime",
          {
            params: {
              startTime: "2025-01-01", // Thời gian bắt đầu (ví dụ)
              endTime: "2025-12-31", // Thời gian kết thúc (ví dụ)
              groupBy: "courses", // Nhóm theo khóa học
            },
          }
        );
        setTotalRevenueData(response.data.report);
      } catch (err) {
        console.error("Error fetching total revenue data", err);
        message.error("Failed to load total revenue data.");
      }
    };

    fetchTotalRevenueData();
  }, []); // Dữ liệu tổng doanh thu sẽ được tải khi component mount

  const COLORS = ["#00C49F", "#FF8042"]; // Màu sắc cho biểu đồ

  // Handle khi chọn khóa học
  const handleCourseChange = (value: number) => {
    setSelectedCourseId(value); // Cập nhật khóa học đã chọn
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="header-custom">Báo Cáo Tổng Quan</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            {/* Dropdown Select để chọn khóa học */}
            <Select
              placeholder="Select Course"
              value={selectedCourseId} // Đảm bảo giá trị là selectedCourseId
              onChange={handleCourseChange} // Hàm xử lý khi thay đổi khóa học
              style={{ width: 200 }}
            >
              {courses.map((course) => (
                <Select.Option key={course.COURSE_ID} value={course.COURSE_ID}>
                  {course.NAME}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div
        className="dashboard-charts-content"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%" }}>
          <h3>1. Doanh thu theo lớp</h3>
          <BarChart width={700} height={400} data={revenueByCourse}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="course_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_revenue" fill="#8884d8" />
          </BarChart>
        </div>

        <div style={{ width: "100%" }}>
          <h3>2. Tỷ lệ thanh toán</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={[
                { name: "Đã thanh toán", value: statusSummary.paid },
                { name: "Chưa thanh toán", value: statusSummary.unpaid },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={150}
              label
              dataKey="value"
            >
              {COLORS.map((color, index) => (
                <Cell key={index} fill={color} />
              ))}
            </Pie>
            <PieTooltip />
            <PieLegend />
          </PieChart>
        </div>

        <div style={{ width: "100%" }}>
          <h3>3. Tổng doanh thu của tất cả các khóa học</h3>
          <LineChart width={700} height={400} data={totalRevenueData}>
            <Line type="monotone" dataKey="total_revenue" stroke="#8884d8" />
            <LineCartesianGrid strokeDasharray="3 3" />
            <LineXAxis dataKey="course_name" />
            <LineYAxis />
            <LineTooltip />
            <LineLegend />
          </LineChart>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
