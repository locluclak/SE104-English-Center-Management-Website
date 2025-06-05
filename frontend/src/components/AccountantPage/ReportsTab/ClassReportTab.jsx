import React, { useEffect, useState } from 'react';
import { fetchRevenueReportByClass, exportRevenueReportByClassCSV } from '../../../services/paymentService';
import { getAllCourses } from '../../../services/courseService';
import Table from '../../common/Table/Table';
import './ClassReportTab.css';

const ClassReportTab = () => {
  const [courseId, setCourseId] = useState('');
  const [report, setReport] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getAllCourses();
        setAvailableCourses(courses);
      } catch (error) {
        console.error('Lỗi khi tải danh sách lớp học:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleViewReport = async () => {
    if (!courseId) return;
    const data = await fetchRevenueReportByClass(courseId);
    setReport(data);
  };

  const handleExportCSV = async () => {
    if (!courseId) return;
    await exportRevenueReportByClassCSV(courseId);
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getColumns = () => {
    return [
      { header: 'Tên', accessor: 'student_name' },
      { header: 'Email', accessor: 'student_email' },
      { header: 'Giá', accessor: 'payment_price' },
      { header: 'Loại', accessor: 'payment_type' },
      { header: 'Trạng thái', accessor: 'payment_status' },
      {
        header: 'Ngày thanh toán',
        render: (row) => row.payment_date ? formatDateTime(row.payment_date) : '-'
      }
    ];
  };

  return (
    <div className="class-report-container">
      <h3 className="report-title">Báo cáo doanh thu theo lớp học</h3>

      <div className="report-controls-row">
        <div className="control-group">
          <label htmlFor="course-id">Chọn lớp:</label>
          <select id="course-id" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">-- Chọn lớp học --</option>
            {availableCourses.map((course) => (
              <option key={course.COURSE_ID} value={course.COURSE_ID}>{course.NAME}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>&nbsp;</label>
          <button className="view-button" onClick={handleViewReport}>Xem báo cáo</button>
        </div>
        <div className="control-group">
          <label>&nbsp;</label>
          <button className="export-button" onClick={handleExportCSV}>Xuất CSV</button>
        </div>
      </div>

      {report && (
        <>
          <h4>{report.courseDetails?.course_name}</h4>
          <p>Sĩ số: {report.students?.length ?? 0}</p>
          <Table columns={getColumns()} data={report.students} />
          <p className="total-revenue">Doanh thu: {report.totalRevenue}đ</p>
        </>
      )}
    </div>
  );
};

export default ClassReportTab;
