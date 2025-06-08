"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { Tabs, TabsList, TabsTrigger } from "../../components/Ui/Tabs//tabs"
import { Users, Calendar, ArrowLeft, Clock } from "../../components/Ui/Icons/icons"
import { StudentAssignmentItem } from "../../components/Student/StudentAssignmentItem"
import { StudentDocumentItem } from "../../components/Student/StudentDocumentItem"
import "./StudentCourseDetail.scss"

interface CourseDetail {
  id: string
  name: string
  description: string
  instructor: string
  schedule: string
  progress: number
  status: "active" | "completed" | "paused"
  startDate: string
  endDate: string
  syllabus: string
  nextClass: string
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: "pending" | "submitted" | "graded"
  grade?: number
  feedback?: string
}

interface Document {
  id: string
  title: string
  description: string
  uploadDate: string
  fileType: "pdf" | "doc" | "ppt" | "image" | "video" | "other"
  fileSize: string
  downloadUrl: string
}

const StudentCourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API calls
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      setCourseDetail({
        id: courseId || "1",
        name: "Mathematics 101",
        description: "Basic mathematics course covering algebra and geometry",
        instructor: "Dr. Smith",
        schedule: "Mon, Wed, Fri 9:00 AM",
        progress: 75,
        status: "active",
        startDate: "2024-01-01",
        endDate: "2024-05-30",
        syllabus:
          "This course covers fundamental mathematical concepts including algebra, geometry, and basic calculus. Students will learn problem-solving techniques and develop analytical thinking skills.",
        nextClass: "2024-01-15T09:00:00",
      })

      setAssignments([
        {
          id: "a1",
          title: "Algebra Homework 1",
          description: "Complete problems 1-10 in Chapter 3",
          dueDate: "2024-01-20T23:59:00",
          status: "pending",
        },
        {
          id: "a2",
          title: "Geometry Quiz",
          description: "Online quiz covering triangles and circles",
          dueDate: "2024-01-25T23:59:00",
          status: "pending",
        },
        {
          id: "a3",
          title: "Midterm Project",
          description: "Research paper on a mathematical concept of your choice",
          dueDate: "2024-02-15T23:59:00",
          status: "pending",
        },
        {
          id: "a4",
          title: "Practice Problems",
          description: "Complete the practice problems from last week's lecture",
          dueDate: "2024-01-10T23:59:00",
          status: "submitted",
        },
      ])

      setDocuments([
        {
          id: "d1",
          title: "Course Syllabus",
          description: "Complete course syllabus and schedule",
          uploadDate: "2024-01-01",
          fileType: "pdf",
          fileSize: "1.2 MB",
          downloadUrl: "/files/syllabus.pdf",
        },
        {
          id: "d2",
          title: "Lecture 1: Introduction to Algebra",
          description: "Slides from the first lecture",
          uploadDate: "2024-01-05",
          fileType: "ppt",
          fileSize: "3.5 MB",
          downloadUrl: "/files/lecture1.ppt",
        },
        {
          id: "d3",
          title: "Textbook Chapter 1-3",
          description: "Digital copy of the textbook chapters 1-3",
          uploadDate: "2024-01-05",
          fileType: "pdf",
          fileSize: "8.7 MB",
          downloadUrl: "/files/textbook_ch1-3.pdf",
        },
        {
          id: "d4",
          title: "Practice Problems Set 1",
          description: "Additional practice problems for Week 1",
          uploadDate: "2024-01-07",
          fileType: "pdf",
          fileSize: "0.8 MB",
          downloadUrl: "/files/practice_set1.pdf",
        },
      ])

      setLoading(false)
    }, 500)
  }, [courseId])

  const handleBack = () => {
    navigate("/student/courses")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatNextClass = (dateString: string) => {
    if (!dateString) return "No upcoming classes"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    )
  }

  if (!courseDetail) {
    return (
      <div className="course-not-found">
        <h2>Course Not Found</h2>
        <p>The requested course could not be found.</p>
        <Button onClick={handleBack}>Back to Courses</Button>
      </div>
    )
  }

  return (
    <div className="student-course-detail">
      <div className="course-header">
        <Button variant="ghost" className="back-button" onClick={handleBack}>
          <ArrowLeft className="icon" />
          Back to Courses
        </Button>
        <Badge className={`status-${courseDetail.status}`}>{courseDetail.status}</Badge>
      </div>

      <div className="course-title-section">
        <h1>{courseDetail.name}</h1>
        <div className="course-meta">
          <div className="meta-item">
            <Users className="icon" />
            <span>Instructor: {courseDetail.instructor}</span>
          </div>
          <div className="meta-item">
            <Calendar className="icon" />
            <span>{courseDetail.schedule}</span>
          </div>
          <div className="meta-item">
            <Clock className="icon" />
            <span>Next Class: {formatNextClass(courseDetail.nextClass)}</span>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Course Progress</span>
          <span>{courseDetail.progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${courseDetail.progress}%` }}></div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="course-tabs">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        {activeTab === "overview" && (
          <div className="tab-content">
            <Card>
              <CardHeader>
                <CardTitle>Course Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{courseDetail.description}</p>
              </CardContent>
            </Card>

            <div className="overview-grid">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="detail-item">
                    <strong>Start Date:</strong>
                    <span>{formatDate(courseDetail.startDate)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>End Date:</strong>
                    <span>{formatDate(courseDetail.endDate)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Schedule:</strong>
                    <span>{courseDetail.schedule}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <Badge className={`status-${courseDetail.status}`}>{courseDetail.status}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Syllabus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{courseDetail.syllabus}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="upcoming-assignments">
                  {assignments
                    .filter((a) => a.status === "pending")
                    .slice(0, 3)
                    .map((assignment) => (
                      <div key={assignment.id} className="upcoming-assignment-item">
                        <div className="assignment-info">
                          <h4>{assignment.title}</h4>
                          <p>{assignment.description}</p>
                        </div>
                        <div className="assignment-due">
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  {assignments.filter((a) => a.status === "pending").length === 0 && (
                    <p className="no-assignments">No upcoming assignments</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="tab-content">
            <div className="assignments-list">
              {assignments.map((assignment) => (
                <StudentAssignmentItem key={assignment.id} assignment={assignment} courseId={courseDetail.id} />
              ))}
              {assignments.length === 0 && <p className="no-content">No assignments available</p>}
            </div>
          </div>
        )}

        {activeTab === "materials" && (
          <div className="tab-content">
            <div className="documents-list">
              {documents.map((document) => (
                <StudentDocumentItem key={document.id} document={document} />
              ))}
              {documents.length === 0 && <p className="no-content">No materials available</p>}
            </div>
          </div>
        )}
      </Tabs>
    </div>
  )
}

export default StudentCourseDetail
