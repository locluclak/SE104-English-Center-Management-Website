// Bạn có thể cần import một thư viện HTTP client như axios, hoặc sử dụng fetch API có sẵn
// import axios from 'axios'; 

const BASE_URL = 'http://localhost:3000/course/1'; // Thay đổi thành URL API của bạn

const courseService = {
  getAllCourses: async () => {
    try {
      const response = await fetch(`${BASE_URL}/classes`); // Hoặc /courses tùy theo API của bạn
      // const response = await axios.get(`${BASE_URL}/classes`); // Nếu dùng axios

      if (!response.ok) {
        // Xử lý lỗi HTTP (ví dụ: 404, 500)
        const errorData = await response.json(); // Cố gắng đọc thông báo lỗi từ server
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json(); // Trả về dữ liệu JSON
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error; // Ném lỗi để component có thể bắt và hiển thị
    }
  },

  // Bạn có thể thêm các hàm khác ở đây, ví dụ:
  // getCourseById: async (id) => { ... },
  // createCourse: async (courseData) => { ... },
  // updateCourse: async (id, courseData) => { ... },
  // deleteCourse: async (id) => { ... },
};

export default courseService;