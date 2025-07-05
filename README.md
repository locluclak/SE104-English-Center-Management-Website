# Quản Lý Trung Tâm Anh Ngữ (SE104-English-Center-Management-Website)

## Giới thiệu

Đây là dự án website quản lý trung tâm Anh ngữ, hỗ trợ các chức năng quản lý học viên, giáo viên, lớp học, khóa học và điểm số.

## Tính năng

- Quản lý học viên, giáo viên, lớp học, khóa học
- Quản lý điểm số, lịch học, lịch thi
- Phân quyền người dùng (Admin, Giáo viên, Kế toán, Học viên)
- Thống kê, báo cáo

## Công nghệ sử dụng

- Frontend: ReactJs, TypeScript
- Backend: Node.js, Express
- Database: MySQL

## Hướng dẫn cài đặt

1. **Clone dự án:**
   ```bash
   git clone https://github.com/your-username/SE104-English-Center-Management-Website.git
   cd SE104-English-Center-Management-Website
   ```

2. **Cài đặt các thư viện cần thiết:**
   ```bash
   yarn install
   ```

3. **Cấu hình cơ sở dữ liệu MySQL:**
   - Cài đặt MySQL trên máy tính của bạn (nếu chưa có).
   - Tạo một database mới, ví dụ: `english_center`.
   - Cập nhật thông tin kết nối trong file `.env`:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_user
     DB_PASSWORD=your_mysql_password
     DB_NAME=english_center
     ```
   - Chạy các lệnh migrate/seed (nếu có) để khởi tạo bảng dữ liệu.

4. **Cấu hình biến môi trường:**  
   Tạo file `.env` và cấu hình các biến môi trường cần thiết (ví dụ: kết nối database, port, ...).

5. **Chạy dự án:**
   ```bash
   yarn start
   ```

