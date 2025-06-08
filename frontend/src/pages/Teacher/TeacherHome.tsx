"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { BookOpen, Users, Calendar, Clock } from "../../components/Ui/Icons/icons"

interface Course {
  id: string
  name: string
  description: string
  students: number
  maxStudents: number
  schedule: string
  nextClass: string
  status: "active" | "completed" | "paused"
}

interface Assignment {
  id: string
  title: string
  courseId: string
  courseName: string
  dueDate: string
  submissionsCount: number
  totalStudents: number
}

interface TeacherHomeProps {
  teacherId: string
  userRole: string
}

const TeacherHome: React.FC<TeacherHomeProps> = ({ teacherId, userRole }) => {
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([])
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Mock data - replace with actual API calls
    setLoading(true)

    setTimeout(() => {
      setAssignedCourses([
        {
          id: "1",
          name: "Mathematics 101",
          description: "Basic mathematics course",
          students: 25,
          maxStudents: 30,
          schedule: "Mon, Wed, Fri 9:00 AM",
          nextClass: "2024-01-15T09:00:00",
          status: "active",
        },
        {
          id: "2",
          name: "Physics 101",
          description: "Introduction to Physics",
          students: 20,
          maxStudents: 25,
          schedule: "Tue, Thu 2:00 PM",
          nextClass: "2024-01-16T14:00:00",
          status: "active",
        },
        {
          id: "3",
          name: "Chemistry 101",
          description: "Basic chemistry concepts",
          students: 22,
          maxStudents: 25,
          schedule: "Mon, Wed 11:00 AM",
          nextClass: "2024-01-17T11:00:00",
          status: "active",
        },
      ])

      setPendingAssignments([
        {
          id: "1",
          title: "Algebra Homework",
          courseId: "1",
          courseName: "Mathematics 101",
          dueDate: "2024-01-15",
          submissionsCount: 15,
          totalStudents: 25,
        },
        {
          id: "2",
          title: "Physics Lab Report",
          courseId: "2",
          courseName: "Physics 101",
          dueDate: "2024-01-20",
          submissionsCount: 8,
          totalStudents: 20,
        },
      ])

      setLoading(false)
    }, 500)
  }, [teacherId])

  const handleCourseClick = (courseId: string) => {
    navigate(`/teacher/courses/${courseId}`)
  }

  const handleAssignmentClick = (courseId: string, assignmentId: string) => {
    navigate(`/teacher/courses/${courseId}/assignments/${assignmentId}`)
  }

  const formatNextClass = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="teacher-home">
      <div className="page-header">
        <h1>Teacher Dashboard</h1>
        <p>Welcome back!</p>
      </div>

      {/* Assigned Courses Section */}
      <section className="courses-section">
        <h2>My Courses</h2>
        <div className="courses-grid">
          {assignedCourses.map((course) => (
            <Card key={course.id} className="course-card" onClick={() => handleCourseClick(course.id)}>
              <CardHeader>
                <div className="course-header">
                  <div className="course-title-section">
                    <BookOpen className="icon" />
                    <CardTitle>{course.name}</CardTitle>
                  </div>
                  <Badge className={`status-${course.status}`}>{course.status}</Badge>
                </div>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="course-details">
                  <p className="detail-item">
                    <Users className="icon" />
                    Students: {course.students}/{course.maxStudents}
                  </p>
                  <p className="detail-item">
                    <Calendar className="icon" />
                    {course.schedule}
                  </p>
                  <p className="detail-item">
                    <Clock className="icon" />
                    Next Class: {formatNextClass(course.nextClass)}
                  </p>
                </div>
                <Button className="view-course-btn" onClick={() => handleCourseClick(course.id)}>
                  Manage Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {assignedCourses.length === 0 && (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3>No courses assigned</h3>
            <p>You don't have any courses assigned to you yet.</p>
          </div>
        )}
      </section>

      {/* Pending Assignments Section */}
      <section className="assignments-section">
        <h2>Recent Assignment Submissions</h2>
        <div className="assignments-grid">
          {pendingAssignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="assignment-card"
              onClick={() => handleAssignmentClick(assignment.courseId, assignment.id)}
            >
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription>{assignment.courseName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="assignment-details">
                  <p className="detail-item">
                    <Calendar className="icon" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                  <div className="submissions-progress">
                    <div className="progress-header">
                      <span>Submissions</span>
                      <span>
                        {assignment.submissionsCount}/{assignment.totalStudents}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(assignment.submissionsCount / assignment.totalStudents) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  className="view-submissions-btn"
                  onClick={() => handleAssignmentClick(assignment.courseId, assignment.id)}
                >
                  View Submissions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {pendingAssignments.length === 0 && (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3>No pending assignments</h3>
            <p>There are no assignments pending review.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default TeacherHome
