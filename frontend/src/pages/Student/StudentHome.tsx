import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Ui/Card/card"
import { Button } from "@/components/Ui/Button/button"
import { BookOpen, Clock, Users } from "@/components/Ui/Icons/icons"
import { MainApiRequest } from "@/services/MainApiRequest"
import { message } from "antd"
import { useSystemContext } from "@/hooks/useSystemContext"

interface Course {
  id: string
  name: string
  description: string
  instructor: string
  schedule: string
  maxStudents: number
}

interface Assignment {
  id: string
  title: string
  courseId: string
  courseName: string
  dueDate: string
  status: "pending" | "submitted" | "graded"
}

// Lấy tên giáo viên cho mỗi khoá học
const fetchTeacherForCourse = async (courseId: string): Promise<string> => {
  try {
    const res = await MainApiRequest.get(`/course/teacher/${courseId}`)
    const teachers = res.data
    return teachers?.[0]?.NAME || "N/A"
  } catch (err) {
    console.error("Failed to fetch teacher", err)
    return "N/A"
  }
}

const StudentHome: React.FC = () => {
  const [coursesList, setCoursesList] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const { userId } = useSystemContext();
  const studentId = userId || localStorage.getItem("userId");

  useEffect(() => {
    if (!studentId) return

    const fetchCoursesList = async () => {
      try {
        const res = await MainApiRequest.get(`/course/unenrolled-courses/${studentId}`)
        const rawCourses = res.data.courses || []

        const coursesWithTeachers = await Promise.all(
          rawCourses.map(async (cls: any) => {
            const teacherName = await fetchTeacherForCourse(cls.COURSE_ID)

            const cleanDescription = cls.DESCRIPTION?.replace(/\[Giáo viên:.*?\]\s*/, "")

            return {
              id: cls.COURSE_ID,
              name: cls.NAME,
              description: cleanDescription || "",
              instructor: teacherName,
              schedule: cls.START_DATE
                ? new Date(cls.START_DATE).toLocaleDateString("vi-VN")
                : "TBD",
              maxStudents: cls.MAX_STU || 0,
            }
          })
        )

        setCoursesList(coursesWithTeachers)
      } catch (error) {
        console.error("Failed to fetch available courses:", error)
        message.error("Không thể tải danh sách khoá học khả dụng.")
      }
    }

    fetchCoursesList()
  }, [studentId])

  const handleCourseEnroll = async (courseId: string) => {
    if (!studentId) {
      message.error("Không tìm thấy ID sinh viên. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      await MainApiRequest.post("/course/add-student", { studentId, courseId });
      message.success("Ghi danh khoá học thành công!");

      setCoursesList((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseId)
      );
    } catch (error: any) {
      console.error("Failed to enroll in course:", error);
      if (error.response && error.response.status === 409) {
        message.warning("Bạn đã ghi danh vào khoá học này rồi.");
      } else {
        message.error("Không thể ghi danh vào khoá học. Vui lòng thử lại.");
      }
    }
  };

  const handleAssignmentClick = (assignmentId: string) => {
    console.log(`Opening assignment: ${assignmentId}`)
    // TODO: Xử lý chuyển hướng
  }

  return (
    <div className="student-home">
      <div className="page-header">
        <h1>Student Dashboard</h1>
        <p>Welcome back!</p>
      </div>

      {/* Available Courses Section */}
      <section className="courses-section">
        <h2>Available Courses</h2>
        <div className="courses-grid">
          {coursesList.length === 0 && (
            <div className="empty-state">
              <BookOpen className="empty-icon" />
              <h3>Không có khoá học khả dụng</h3>
              <p>Bạn đã ghi danh tất cả các khoá học hoặc chưa có khoá học nào mở.</p>
            </div>
          )}
          {coursesList.map((course) => (
            <Card key={course.id} className="course-card">
              <CardHeader>
                <CardTitle className="course-title">
                  <BookOpen className="icon" />
                  {course.name}
                </CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="course-details">
                  <p className="detail-item">
                    <Users className="icon" />
                    Instructor: {course.instructor}
                  </p>
                  <p className="detail-item">
                    <Clock className="icon" />
                    Start Date: {course.schedule}
                  </p>
                </div>
                <Button
                  className="enroll-btn"
                  onClick={() => handleCourseEnroll(course.id)}
                >
                  Enroll
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default StudentHome
