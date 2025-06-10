import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Ui/Card/card"
import { Button } from "@/components/Ui/Button/button"
import { BookOpen, Clock, Users } from "@/components/Ui/Icons/icons"
import { MainApiRequest } from "@/services/MainApiRequest"
import { message } from "antd"

interface Course {
  id: string
  name: string
  description: string
  instructor: string
  schedule: string
  enrolled: number
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

interface StudentHomeProps {
  studentId: string
  userRole: string
}

// Hàm lấy tên giáo viên (cần được định nghĩa hoặc import)
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

const StudentHome: React.FC<StudentHomeProps> = ({ studentId, userRole }) => {
  const [coursesList, setCoursesList] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    const fetchCoursesList = async () => {
      try {
        const res = await MainApiRequest.get("/course/all")
        const rawCourses = res.data

        const coursesWithTeachers = await Promise.all(
          rawCourses.map(async (cls: any) => {
            const teacherName = await fetchTeacherForCourse(cls.COURSE_ID)

            const cleanDescription = cls.DESCRIPTION?.replace(
              /^[^\[]*\[Giáo viên:\s*.*?\]\s*/,
              ""
            )

            return {
              id: cls.COURSE_ID,
              name: cls.NAME,
              description: cleanDescription || "",
              instructor: teacherName,
              schedule: cls.START_DATE ? new Date(cls.START_DATE).toLocaleDateString() : "TBD",
              enrolled: cls.NUMBER_STU || 0,
              maxStudents: cls.MAX_STU || 0,
            }
          })
        )

        setCoursesList(coursesWithTeachers)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        message.error("Unable to load courses.")
      }
    }

    fetchCoursesList()
  }, [studentId])

  const handleCourseEnroll = (courseId: string) => {
    console.log(`Enrolling in course: ${courseId}`)
    // TODO: Ghi danh
  }

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
                  <p>
                    Enrolled: {course.enrolled}/{course.maxStudents}
                  </p>
                </div>
                <Button
                  className="enroll-btn"
                  onClick={() => handleCourseEnroll(course.id)}
                  disabled={course.enrolled >= course.maxStudents}
                >
                  {course.enrolled >= course.maxStudents ? "Full" : "Enroll"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pending Assignments Section */}
      <section className="assignments-section">
        <h2>Pending Assignments</h2>
        <div className="assignments-grid">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="assignment-card" onClick={() => handleAssignmentClick(assignment.id)}>
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription>{assignment.courseName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="assignment-footer">
                  <span className="due-date">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span className={`status status-${assignment.status}`}>{assignment.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default StudentHome
