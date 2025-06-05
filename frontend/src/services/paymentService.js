import axios from 'axios';

const API_BASE = 'http://localhost:3000/payment'; 

export const fetchRevenueReportByTime = async (startTime, endTime, groupBy) => {
  const response = await axios.get(`${API_BASE}/revenue-report-bytime`, {
    params: { startTime, endTime, groupBy }
  });
  return response.data;
};

export const exportRevenueReportByTimeCSV = async (startTime, endTime, groupBy) => {
  const response = await axios.get(`${API_BASE}/revenue-report-bytime/export`, {
    params: { startTime, endTime, groupBy },
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `revenue-report-${groupBy}-${startTime}-to-${endTime}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const fetchRevenueReportByClass = async (courseId) => {
  const response = await axios.get(`${API_BASE}/revenue-report/${courseId}`);
  return response.data;
};

export const exportRevenueReportByClassCSV = async (courseId) => {
  const response = await axios.get(`${API_BASE}/revenue-report/${courseId}/export`, {
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `revenue-report-course-${courseId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
