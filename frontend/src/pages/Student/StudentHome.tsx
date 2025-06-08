import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Ui/Card/card"
import { Button } from "@/components/Ui/Button/button"
import { BookOpen, Clock, Users } from "@/components/Ui/Icons/icons"

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

const StudentHome: React.FC<StudentHomeProps> = ({ studentId, userRole }) => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    // Mock data - replace with actual API calls
    setAvailableCourses([
      {
        id: "1",
        name: "Mathematics 101",
        description: "Basic mathematics course",
        instructor: "Dr. Smith",
        schedule: "Mon, Wed, Fri 9:00 AM",
        enrolled: 25,
        maxStudents: 30,
      },
      {
        id: "2",
        name: "Physics 101",
        description: "Introduction to Physics",
        instructor: "Dr. Johnson",
        schedule: "Tue, Thu 2:00 PM",
        enrolled: 20,
        maxStudents: 25,
      },
    ])

    setAssignments([
      {
        id: "1",
        title: "Algebra Homework",
        courseId: "1",
        courseName: "Mathematics 101",
        dueDate: "2024-01-15",
        status: "pending",
      },
      {
        id: "2",
        title: "Physics Lab Report",
        courseId: "2",
        courseName: "Physics 101",
        dueDate: "2024-01-20",
        status: "pending",
      },
    ])
  }, [studentId])

  const handleCourseEnroll = (courseId: string) => {
    console.log(`Enrolling in course: ${courseId}`)
    // Implement enrollment logic
  }

  const handleAssignmentClick = (assignmentId: string) => {
    console.log(`Opening assignment: ${assignmentId}`)
    // Navigate to assignment details
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
          {availableCourses.map((course) => (
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
                    {course.schedule}
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
