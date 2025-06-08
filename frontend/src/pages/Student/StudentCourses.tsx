"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { BookOpen, Users, Calendar, ArrowRight } from "lucide-react"

interface EnrolledCourse {
  id: string
  name: string
  description: string
  instructor: string
  schedule: string
  progress: number
  status: "active" | "completed" | "paused"
  nextClass: string
}

interface StudentCoursesProps {
  studentId: string
  userRole: string
}

const StudentCourses: React.FC<StudentCoursesProps> = ({ studentId, userRole }) => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Mock data - replace with actual API calls
    setEnrolledCourses([
      {
        id: "1",
        name: "Mathematics 101",
        description: "Basic mathematics course covering algebra and geometry",
        instructor: "Dr. Smith",
        schedule: "Mon, Wed, Fri 9:00 AM",
        progress: 75,
        status: "active",
        nextClass: "2024-01-15T09:00:00",
      },
      {
        id: "2",
        name: "Physics 101",
        description: "Introduction to Physics principles and applications",
        instructor: "Dr. Johnson",
        schedule: "Tue, Thu 2:00 PM",
        progress: 60,
        status: "active",
        nextClass: "2024-01-16T14:00:00",
      },
      {
        id: "3",
        name: "Chemistry 101",
        description: "Basic chemistry concepts and laboratory work",
        instructor: "Dr. Williams",
        schedule: "Mon, Wed 11:00 AM",
        progress: 100,
        status: "completed",
        nextClass: "",
      },
    ])
  }, [studentId])

  const handleCourseClick = (courseId: string) => {
    setSelectedCourse(courseId)
    console.log(`Opening course details for: ${courseId}`)
    // Navigate to course detail page or show course content
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active"
      case "completed":
        return "status-completed"
      case "paused":
        return "status-paused"
      default:
        return "status-default"
    }
  }

  const formatNextClass = (dateString: string) => {
    if (!dateString) return "Course completed"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="student-courses">
      <div className="page-header">
        <h1>My Courses</h1>
        <Badge variant="secondary">{enrolledCourses.filter((c) => c.status === "active").length} Active Courses</Badge>
      </div>

      <div className="courses-grid">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="course-card" onClick={() => handleCourseClick(course.id)}>
            <CardHeader>
              <div className="course-header">
                <div className="course-title-section">
                  <BookOpen className="icon" />
                  <CardTitle>{course.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
              </div>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>

            <CardContent className="course-content">
              <div className="course-details">
                <div className="detail-item">
                  <Users className="icon" />
                  <span>Instructor: {course.instructor}</span>
                </div>
                <div className="detail-item">
                  <Calendar className="icon" />
                  <span>{course.schedule}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                </div>
              </div>

              {/* Next Class Info */}
              {course.status === "active" && (
                <div className="next-class">
                  <p className="next-class-label">Next Class:</p>
                  <p className="next-class-time">{formatNextClass(course.nextClass)}</p>
                </div>
              )}

              <Button className="view-course-btn" variant="outline">
                <span>View Course</span>
                <ArrowRight className="icon" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <h3>No courses enrolled</h3>
          <p>Visit the home page to browse and enroll in available courses.</p>
        </div>
      )}
    </div>
  )
}

export default StudentCourses
