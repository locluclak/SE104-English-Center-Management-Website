"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Ui/Card/card"
import { Button } from "@/components/Ui/Button/button"
import { Badge } from "@/components/Ui/Badge/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/Ui/Tabs/tabs"
import { Users, Calendar, ArrowLeft, Clock } from "@/components/Ui/Icons/icons"
import { StudentAssignmentItem } from "@/components/Student/StudentAssignmentItem"
import { StudentDocumentItem } from "@/components/Student/StudentDocumentItem"
import { MainApiRequest } from "@/services/MainApiRequest"
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
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: "pending"
}

interface Document {
  DOC_ID: number
  NAME: string
  DESCRIPTION: string
  FILE?: string 
  COURSE_ID: string
}

const StudentCourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const formatStatus = (start: string, end: string): CourseDetail["status"] => {
    const now = new Date()
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (now < startDate) return "paused"
    if (now > endDate) return "completed"
    return "active"
  }

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return
      try {
        const res = await MainApiRequest.get(`/course/${courseId}`)
        const teacherRes = await MainApiRequest.get(`/course/teacher/${courseId}`)

        const course = res.data
        const instructor = teacherRes.data?.[0]?.NAME || "N/A"
        const status = formatStatus(course.START_DATE, course.END_DATE)

        setCourseDetail({
          id: course.COURSE_ID,
          name: course.NAME,
          description: course.DESCRIPTION?.replace(/^\[Giáo viên:.*?\]\s*/, "") || "",
          instructor,
          schedule: `${new Date(course.START_DATE).toLocaleDateString("vi-VN")} - ${new Date(course.END_DATE).toLocaleDateString("vi-VN")}`,
          progress: status === "completed" ? 100 : status === "active" ? 50 : 0,
          status,
          startDate: course.START_DATE,
          endDate: course.END_DATE,
          syllabus: course.DESCRIPTION || "",
        })

        const assignmentRes = await MainApiRequest.get(`/assignment/getbycourse/${courseId}`)
        const assignmentsRaw = assignmentRes.data?.assignments || []

        const simplifiedAssignments = assignmentsRaw.map((a: any): Assignment => ({
          id: a.AS_ID,
          title: a.NAME,
          description: a.DESCRIPTION || "",
          dueDate: a.END_DATE,
          status: "pending", // mặc định, sẽ xử lý ở component con
        }))

        setAssignments(simplifiedAssignments)

        const documentRes = await MainApiRequest.get(`/document/getbycourse/${courseId}`)
        const documentsRaw = documentRes.data || []

        const simplifiedDocuments = documentsRaw.map((doc: any) => ({
          DOC_ID: doc.DOC_ID,
          NAME: doc.NAME,
          DESCRIPTION: doc.DESCRIPTION || "",
          FILE: `/uploads/${doc.FILE?.split('/').pop()}`,
          COURSE_ID: doc.COURSE_ID,
        }));
        setDocuments(simplifiedDocuments)
      } catch (err) {
        console.error("Lỗi khi tải khoá học:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId])

  const handleBack = () => navigate("/student/courses")

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString()

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
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Course Progress</span>
          <span>{courseDetail.progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${courseDetail.progress}%` }} />
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
              {documents.map((doc) => (
                <StudentDocumentItem key={doc.DOC_ID} document={{
                  id: doc.DOC_ID,
                  title: doc.NAME,
                  description: doc.DESCRIPTION,
                  file: doc.FILE, 
                }} />
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
