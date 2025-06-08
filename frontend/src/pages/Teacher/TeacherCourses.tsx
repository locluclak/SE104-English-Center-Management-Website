"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { BookOpen, Users, Calendar, ArrowRight } from "../../components/Ui/Icons/icons"

interface TeacherCourse {
  id: string
  name: string
  description: string
  students: number
  maxStudents: number
  schedule: string
  nextClass: string
  status: "active" | "completed" | "paused"
}

interface TeacherCoursesProps {
  teacherId: string
  userRole: string
}

const TeacherCourses: React.FC<TeacherCoursesProps> = ({ teacherId, userRole }) => {
  const [courses, setCourses] = useState<TeacherCourse[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Mock data - replace with actual API calls
    setLoading(true)

    setTimeout(() => {
      setCourses([
        {
          id: "1",
          name: "Mathematics 101",
          description: "Basic mathematics course covering algebra and geometry",
          students: 25,
          maxStudents: 30,
          schedule: "Mon, Wed, Fri 9:00 AM",
          nextClass: "2024-01-15T09:00:00",
          status: "active",
        },
        {
          id: "2",
          name: "Physics 101",
          description: "Introduction to Physics principles and applications",
          students: 20,
          maxStudents: 25,
          schedule: "Tue, Thu 2:00 PM",
          nextClass: "2024-01-16T14:00:00",
          status: "active",
        },
        {
          id: "3",
          name: "Chemistry 101",
          description: "Basic chemistry concepts and laboratory work",
          students: 22,
          maxStudents: 25,
          schedule: "Mon, Wed 11:00 AM",
          nextClass: "2024-01-17T11:00:00",
          status: "active",
        },
        {
          id: "4",
          name: "Biology 101",
          description: "Introduction to biological concepts",
          students: 25,
          maxStudents: 25,
          schedule: "Tue, Thu 10:00 AM",
          nextClass: "",
          status: "completed",
        },
      ])

      setLoading(false)
    }, 500)
  }, [teacherId])

  const handleCourseClick = (courseId: string) => {
    navigate(`/teacher/courses/${courseId}`)
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
    if (!dateString) return "No upcoming classes"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="teacher-courses">
      <div className="page-header">
        <h1>My Courses</h1>
        <Badge variant="secondary">{courses.filter((c) => c.status === "active").length} Active Courses</Badge>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <Card key={course.id} className="course-card">
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
                  <span>
                    Students: {course.students}/{course.maxStudents}
                  </span>
                </div>
                <div className="detail-item">
                  <Calendar className="icon" />
                  <span>{course.schedule}</span>
                </div>
              </div>

              {/* Next Class Info */}
              {course.status === "active" && (
                <div className="next-class">
                  <p className="next-class-label">Next Class:</p>
                  <p className="next-class-time">{formatNextClass(course.nextClass)}</p>
                </div>
              )}

              <Button className="view-course-btn" onClick={() => handleCourseClick(course.id)}>
                <span>Manage Course</span>
                <ArrowRight className="icon" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <h3>No courses assigned</h3>
          <p>You don't have any courses assigned to you yet.</p>
        </div>
      )}
    </div>
  )
}

export default TeacherCourses
