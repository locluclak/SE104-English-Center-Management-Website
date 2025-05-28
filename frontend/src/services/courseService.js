// src/services/courseService.js
import axios from 'axios';

const API_BASE = '/api/courses'; // Điều chỉnh theo base path backend của bạn

// Tạo khóa học mới
export const createCourse = async (courseData) => {
  try {
    const response = await axios.post(`${API_BASE}/create`, courseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Lấy thông tin khóa học theo ID
export const getCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${API_BASE}/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Thêm giáo viên vào khóa học
export const addTeacherToCourse = async ({ teacherId, courseId, role }) => {
  try {
    const response = await axios.post(`${API_BASE}/add-teacher`, { teacherId, courseId, role });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Xóa giáo viên khỏi khóa học
export const removeTeacherFromCourse = async ({ teacherId, courseId }) => {
  try {
    const response = await axios.delete(`${API_BASE}/remove-teacher`, { data: { teacherId, courseId } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Thêm học viên vào khóa học và tạo thanh toán
export const addStudentToCourse = async ({ studentId, courseId, paymentType, paymentDescription }) => {
  try {
    const response = await axios.post(`${API_BASE}/add-student`, {
      studentId,
      courseId,
      paymentType,
      paymentDescription,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};