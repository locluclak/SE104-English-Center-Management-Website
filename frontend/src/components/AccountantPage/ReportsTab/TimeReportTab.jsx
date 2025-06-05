import React, { useState } from 'react';
import { fetchRevenueReportByTime, exportRevenueReportByTimeCSV } from '../../../services/paymentService';
import Table from '../../common/Table/Table';
import './TimeReportTab.css';

const TimeReportTab = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [groupBy, setGroupBy] = useState('courses');
  const [report, setReport] = useState([]);
  const [overallRevenue, setOverallRevenue] = useState(0);

  const handleViewReport = async () => {
    const data = await fetchRevenueReportByTime(startTime, endTime, groupBy);
    setReport(data.report);
    setOverallRevenue(data.overallRevenue);
  };

  const handleExportCSV = async () => {
    await exportRevenueReportByTimeCSV(startTime, endTime, groupBy);
  };

    const getColumns = () => {
    if (groupBy === 'courses') {
      return [
        { header: 'ID', accessor: 'course_id' },
        { header: 'COURSE', accessor: 'course_name' },
        { header: 'REVENUE', accessor: 'total_revenue' }
      ];
    } else if (groupBy === 'students') {
      return [
        { header: 'ID', accessor: 'student_id' },
        { header: 'NAME', accessor: 'student_name' },
        { header: 'EMAIL', accessor: 'student_email' },
        { header: 'PAID', accessor: 'total_paid' }
      ];
    }
    return [];
  };

  return (
    <div className="time-report-container">
      <h3 className="report-title">Báo cáo doanh thu theo thời gian</h3>

      <div className="report-controls-row">
        <div className="control-group">
          <label htmlFor="start-date">Từ:</label>
          <input id="start-date" type="date" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="control-group">
          <label htmlFor="end-date">Đến:</label>
          <input id="end-date" type="date" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <div className="control-group">
          <label htmlFor="group-by">Nhóm theo:</label>
          <select id="group-by" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="courses">Theo lớp học</option>
            <option value="students">Theo học viên</option>
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

      {report.length > 0 && (
       <Table columns={getColumns()} data={report} />
      )}

      <p className="total-revenue"><strong>Tổng doanh thu:</strong> {overallRevenue}</p>
    </div>
  );
};

export default TimeReportTab;
