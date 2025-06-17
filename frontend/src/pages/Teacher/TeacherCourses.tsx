"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { BookOpen, Users, Calendar, ArrowRight } from "../../components/Ui/Icons/icons"
import { MainApiRequest } from "@/services/MainApiRequest"

interface TeacherCourse {
  id: string
  name: string
  description: string
  students: number
  maxStudents: number
  schedule: string
  nextClass: string
  status: "active" | "completed" | "paused" | "upcoming"
  START_DATE?: string;
  END_DATE?: string;
  progress?: number;
}

interface TeacherCoursesProps {
  teacherId: string
  userRole: string
}

const getCourseStatus = (
  startDate: string,
  endDate: string
): "active" | "completed" | "upcoming" | "paused" => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "active";
};


const TeacherCourses: React.FC<TeacherCoursesProps> = ({ teacherId, userRole }) => {
  console.log("TeacherCourses rendered. Prop teacherId:", teacherId);

  const [courses, setCourses] = useState<TeacherCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchTeacherCourses = useCallback(async () => {
    setLoading(true)
    setError(null)

    console.log("fetchTeacherCourses called with teacherId:", teacherId);

    if (!teacherId) {
      setError("Teacher ID is missing. Cannot fetch courses.")
      setLoading(false)
      return
    }

    try {
      const response = await MainApiRequest.get<TeacherCourse[]>(`/course/teacher-courses/${teacherId}`)
      
      const mappedCourses: TeacherCourse[] = response.data.map(course => {
        const status = getCourseStatus(course.START_DATE || '', course.END_DATE || '');
        const progress = status === "completed" ? 100 : status === "active" ? 50 : 0; // Demo logic for teachers
        
        return {
          ...course,
          status: status,
          progress: progress,
          schedule: `${new Date(course.START_DATE!).toLocaleDateString("vi-VN")} - ${new Date(course.END_DATE!).toLocaleDateString("vi-VN")}`
        };
      });

      setCourses(mappedCourses);
    } catch (err) {
      console.error("Failed to fetch teacher courses:", err)
      setError("Failed to load courses. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => {
    fetchTeacherCourses()
  }, [fetchTeacherCourses])

  const handleCourseClick = (courseId: string) => {
    navigate(`/teacher/courses/${courseId}`)
  }

  const getStatusColor = (status: TeacherCourse['status']) => {
    switch (status) {
      case "active":
        return "status-active"
      case "completed":
        return "status-completed"
      case "upcoming":
        return "status-upcoming"
      default:
        return "status-default"
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <Button onClick={fetchTeacherCourses}>Retry</Button>
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
        {courses.length > 0 ? (
          courses.map((course) => (
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

                {typeof course.progress === 'number' && (
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button className="view-course-btn" onClick={() => handleCourseClick(course.id)}>
                  <span>Manage Course</span>
                  <ArrowRight className="icon" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3>No courses assigned</h3>
            <p>You don't have any courses assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherCourses