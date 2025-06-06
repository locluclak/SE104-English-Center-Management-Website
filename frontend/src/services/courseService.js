const API_BASE_URL = 'http://localhost:3000/course';

// Lấy danh sách tất cả khóa học
export const getAllCourses = async () => {
  const response = await fetch(`${API_BASE_URL}/all`);
  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
};

// Lấy thông tin khóa học theo ID
export const getCourseById = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/${courseId}`);
  if (!response.ok) throw new Error('Failed to fetch course');
  return response.json();
};

// Lấy danh sách học viên trong một khóa học
export const getStudentsInCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/${courseId}/students`);
  if (!response.ok) throw new Error('Failed to fetch students in course');
  return response.json();
};

// Lấy tất cả khóa học của một học viên
export const getCoursesByStudentId = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/student/${studentId}`);
  if (!response.ok) throw new Error('Failed to fetch student courses');
  return response.json();
};

// Tạo khóa học mới
export const createCourse = async (courseData) => {
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) throw new Error('Failed to create course');
  return response.json();
};

// Cập nhật khóa học theo ID
export const updateCourse = async (courseId, updateData) => {
  const response = await fetch(`${API_BASE_URL}/update/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) throw new Error('Failed to update course');
  return response.json();
};

// Thêm giáo viên vào khóa học
export const addTeacherToCourse = async ({ teacherId, courseId, role }) => {
  const response = await fetch(`${API_BASE_URL}/add-teacher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacherId, courseId, role }),
  });
  if (!response.ok) throw new Error('Failed to add teacher to course');
  return response.json();
};

// Xóa giáo viên khỏi khóa học
export const removeTeacherFromCourse = async ({ teacherId, courseId }) => {
  const response = await fetch(`${API_BASE_URL}/remove-teacher`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacherId, courseId }),
  });
  if (!response.ok) throw new Error('Failed to remove teacher from course');
  return response.json();
};

// Thêm học viên vào khóa học và tạo thanh toán
export const addStudentToCourse = async ({ studentId, courseId, paymentType, paymentDescription }) => {
  const response = await fetch(`${API_BASE_URL}/add-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, courseId, paymentType, paymentDescription }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    // It's good practice to log the full error if possible during development
    console.error('Backend error on addStudentToCourse:', errorData);
    throw new Error(errorData.message || 'Failed to add student to course');
  }
  return response.json();
};

// Xóa học viên khỏi khóa học
export const removeStudentFromCourse = async ({ studentId, courseId }) => {
  const response = await fetch(`${API_BASE_URL}/remove-student`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, courseId }),
  });
  if (!response.ok) throw new Error('Failed to remove student from course');
  return response.json();
};

// Lấy tất cả khóa học của một giáo viên
export const getCoursesByTeacherId = async (teacherId) => {
  const response = await fetch(`${API_BASE_URL}/teacher/${teacherId}`);
  if (!response.ok) throw new Error('Failed to fetch teacher courses');
  return response.json();
};
