"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { Tabs, TabsList, TabsTrigger } from "../../components/Ui/Tabs/tabs"
import { Input } from "../../components/Ui/Input/input"
import { Textarea } from "../../components/Ui/Textarea/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "../../components/Ui/Dialog/dialog"
import { Users, Calendar, ArrowLeft, Clock, Plus, Search, FileText } from "../../components/Ui/Icons/icons"
import { TeacherAssignmentItem } from "../../components/Teacher/TeacherAssignmentItem"
import { TeacherDocumentItem } from "../../components/Teacher/TeacherDocumentItem"
import { TeacherStudentItem } from "../../components/Teacher/TeacherStudentItem"
import "./TeacherCourseDetail.scss"

interface CourseDetail {
  id: string
  name: string
  description: string
  students: number
  maxStudents: number
  schedule: string
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
  submissionsCount: number
  totalStudents: number
  attachments: {
    id: string
    fileName: string
    fileSize: string
    fileType: string
    downloadUrl: string
  }[]
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

interface Student {
  id: string
  name: string
  email: string
  progress: number
  lastActivity: string
}

const TeacherCourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Dialog states
  const [isNewAssignmentDialogOpen, setIsNewAssignmentDialogOpen] = useState(false)
  const [isNewDocumentDialogOpen, setIsNewDocumentDialogOpen] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    attachments: [] as File[],
  })
  const [newDocument, setNewDocument] = useState({ title: "", description: "", file: null as File | null })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Mock data - replace with actual API calls
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      setCourseDetail({
        id: courseId || "1",
        name: "Mathematics 101",
        description: "Basic mathematics course covering algebra and geometry",
        students: 25,
        maxStudents: 30,
        schedule: "Mon, Wed, Fri 9:00 AM",
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
          submissionsCount: 15,
          totalStudents: 25,
          attachments: [],
        },
        {
          id: "a2",
          title: "Geometry Quiz",
          description: "Online quiz covering triangles and circles",
          dueDate: "2024-01-25T23:59:00",
          submissionsCount: 8,
          totalStudents: 25,
          attachments: [],
        },
        {
          id: "a3",
          title: "Midterm Project",
          description: "Research paper on a mathematical concept of your choice",
          dueDate: "2024-02-15T23:59:00",
          submissionsCount: 0,
          totalStudents: 25,
          attachments: [],
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
      ])

      setStudents([
        {
          id: "s1",
          name: "John Doe",
          email: "john.doe@example.com",
          progress: 85,
          lastActivity: "2024-01-14T10:30:00",
        },
        {
          id: "s2",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          progress: 92,
          lastActivity: "2024-01-14T09:15:00",
        },
        {
          id: "s3",
          name: "Michael Johnson",
          email: "michael.johnson@example.com",
          progress: 78,
          lastActivity: "2024-01-13T14:45:00",
        },
        {
          id: "s4",
          name: "Emily Brown",
          email: "emily.brown@example.com",
          progress: 65,
          lastActivity: "2024-01-12T11:20:00",
        },
        {
          id: "s5",
          name: "David Wilson",
          email: "david.wilson@example.com",
          progress: 90,
          lastActivity: "2024-01-14T08:50:00",
        },
      ])

      setLoading(false)
    }, 500)
  }, [courseId])

  const handleBack = () => {
    navigate("/teacher/courses")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatNextClass = (dateString: string) => {
    if (!dateString) return "No upcoming classes"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Thêm function để handle file upload
  const handleAssignmentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setNewAssignment({ ...newAssignment, attachments: [...newAssignment.attachments, ...filesArray] })
    }
  }

  // Thêm function để remove file
  const removeAssignmentFile = (index: number) => {
    const updatedFiles = newAssignment.attachments.filter((_, i) => i !== index)
    setNewAssignment({ ...newAssignment, attachments: updatedFiles })
  }

  // Cập nhật handleCreateAssignment để xử lý file attachments
  const handleCreateAssignment = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Creating new assignment:", newAssignment)

      // Process attachments
      const attachments = newAssignment.attachments.map((file, index) => ({
        id: `att_${Date.now()}_${index}`,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fileType: file.name.split(".").pop() || "unknown",
        downloadUrl: `/files/${file.name}`,
      }))

      // Add the new assignment to the list (in a real app, this would come from the API response)
      const newId = `a${assignments.length + 1}`
      setAssignments([
        ...assignments,
        {
          id: newId,
          title: newAssignment.title,
          description: newAssignment.description,
          dueDate: newAssignment.dueDate,
          submissionsCount: 0,
          totalStudents: courseDetail?.students || 0,
          attachments: attachments,
        },
      ])

      // Reset form and close dialog
      setNewAssignment({ title: "", description: "", dueDate: "", attachments: [] })
      setIsSubmitting(false)
      setIsNewAssignmentDialogOpen(false)
    }, 1000)
  }

  const handleUploadDocument = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Uploading new document:", newDocument)

      // Add the new document to the list (in a real app, this would come from the API response)
      const newId = `d${documents.length + 1}`
      const fileType = newDocument.file?.name.split(".").pop() || "other"
      const fileSize = newDocument.file ? `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB` : "0 KB"

      setDocuments([
        ...documents,
        {
          id: newId,
          title: newDocument.title,
          description: newDocument.description,
          uploadDate: new Date().toISOString().split("T")[0],
          fileType: fileType as any,
          fileSize: fileSize,
          downloadUrl: `/files/${newDocument.file?.name || "document"}`,
        },
      ])

      // Reset form and close dialog
      setNewDocument({ title: "", description: "", file: null })
      setIsSubmitting(false)
      setIsNewDocumentDialogOpen(false)
    }, 1000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({ ...newDocument, file: e.target.files[0] })
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    <div className="teacher-course-detail">
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
            <span>
              Students: {courseDetail.students}/{courseDetail.maxStudents}
            </span>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="course-tabs">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
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
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <Users className="icon" />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">3 new students enrolled in the course</p>
                      <p className="activity-time">2 days ago</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <Calendar className="icon" />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">You uploaded "Lecture 1: Introduction to Algebra"</p>
                      <p className="activity-time">5 days ago</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <Clock className="icon" />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">Course schedule was updated</p>
                      <p className="activity-time">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Assignments</h2>
              <Button onClick={() => setIsNewAssignmentDialogOpen(true)}>
                <Plus className="icon" />
                Create Assignment
              </Button>
            </div>

            <div className="assignments-list">
              {assignments.map((assignment) => (
                <TeacherAssignmentItem key={assignment.id} assignment={assignment} courseId={courseDetail.id} />
              ))}
              {assignments.length === 0 && <p className="no-content">No assignments available</p>}
            </div>

            {/* Create Assignment Dialog */}
            <Dialog open={isNewAssignmentDialogOpen} onOpenChange={setIsNewAssignmentDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>Create a new assignment for students in this course.</DialogDescription>
                </DialogHeader>

                <div className="dialog-form">
                  <div className="form-field">
                    <label>Title</label>
                    <Input
                      placeholder="Assignment title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Description</label>
                    <Textarea
                      placeholder="Assignment description"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Due Date</label>
                    <Input
                      type="datetime-local"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Attach Files (Optional)</label>
                    <Input type="file" multiple onChange={handleAssignmentFileChange} />
                    {newAssignment.attachments.length > 0 && (
                      <div className="attached-files">
                        <h5>Attached Files:</h5>
                        {newAssignment.attachments.map((file, index) => (
                          <div key={index} className="attached-file-item">
                            <div className="file-info">
                              <FileText className="icon" />
                              <div className="file-details">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => removeAssignmentFile(index)}>
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewAssignmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAssignment}
                    disabled={isSubmitting || !newAssignment.title || !newAssignment.dueDate}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Assignment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "materials" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Course Materials</h2>
              <Button onClick={() => setIsNewDocumentDialogOpen(true)}>
                <Plus className="icon" />
                Upload Material
              </Button>
            </div>

            <div className="documents-list">
              {documents.map((document) => (
                <TeacherDocumentItem key={document.id} document={document} />
              ))}
              {documents.length === 0 && <p className="no-content">No materials available</p>}
            </div>

            {/* Upload Document Dialog */}
            <Dialog open={isNewDocumentDialogOpen} onOpenChange={setIsNewDocumentDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Course Material</DialogTitle>
                  <DialogDescription>Upload a new document for students in this course.</DialogDescription>
                </DialogHeader>

                <div className="dialog-form">
                  <div className="form-field">
                    <label>Title</label>
                    <Input
                      placeholder="Document title"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Description</label>
                    <Textarea
                      placeholder="Document description"
                      value={newDocument.description}
                      onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>File</label>
                    <Input type="file" onChange={handleFileChange} />
                    {newDocument.file && (
                      <div className="selected-file">
                        <span>Selected: {newDocument.file.name}</span>
                        <span className="file-size">({(newDocument.file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewDocumentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadDocument}
                    disabled={isSubmitting || !newDocument.title || !newDocument.file}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? "Uploading..." : "Upload Material"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "students" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Enrolled Students</h2>
              <div className="search-input">
                <Search className="search-icon" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="students-list">
              {filteredStudents.map((student) => (
                <TeacherStudentItem key={student.id} student={student} courseId={courseDetail.id} />
              ))}
              {filteredStudents.length === 0 && (
                <p className="no-content">{searchTerm ? "No students match your search" : "No students enrolled"}</p>
              )}
            </div>
          </div>
        )}
      </Tabs>
    </div>
  )
}

export default TeacherCourseDetail
