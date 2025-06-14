"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
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
import { MainApiRequest } from "@/services/MainApiRequest"
import "./TeacherCourseDetail.scss"

interface BackendCourseDetail {
  COURSE_ID: string;
  NAME: string;
  DESCRIPTION: string;
  NUMBER_STU: number;
  MAX_STU: number;
  PRICE: number;
  START_DATE: string;
  END_DATE: string;
}

interface CourseDetail {
  id: string;
  name: string;
  description: string;
  students: number;
  maxStudents: number;
  price: number;
  startDate: string;
  endDate: string;
  schedule: string;
  nextClass: string;
  status: "active" | "completed" | "paused" | "upcoming";
  syllabus: string;
}

interface BackendAssignment {
  AS_ID: string;
  NAME: string;
  DESCRIPTION: string;
  START_DATE: string;
  END_DATE: string;
  FILENAME: string | null;
  FILE: string | null;
  COURSE_ID: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  submissionsCount: number;
  totalStudents: number;
  attachments: {
    id: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    downloadUrl: string;
  }[];
}

interface BackendDocument {
  DOC_ID: string;
  NAME: string;
  DESCRIPTION: string;
  FILENAME: string | null;
  FILE: string | null;
  COURSE_ID: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  fileType: "pdf" | "doc" | "ppt" | "image" | "video" | "other";
  fileSize: string;
  downloadUrl: string;
}

interface BackendStudent {
  ID: string;
  NAME: string;
  EMAIL: string;
  PHONE_NUMBER: string;
  DATE_OF_BIRTH: string;
  ENROLL_DATE: string;
  PAYMENT_STATUS?: "UNPAID" | "PAID" | "DEFERRED";
}

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  lastActivity: string;
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
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("")

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

  const fetchCourseData = useCallback(async () => {
    setLoading(true)
    setError(null)
    if (!courseId) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }
    try {
      const courseResponse = await MainApiRequest.get<BackendCourseDetail>(`/course/${courseId}`);
      
      const now = new Date();
      const startDate = new Date(courseResponse.data.START_DATE);
      const endDate = new Date(courseResponse.data.END_DATE);
      let status: "active" | "completed" | "paused" | "upcoming" = "active";
      if (now < startDate) {
        status = "upcoming";
      } else if (now > endDate) {
        status = "completed";
      }
      
      const schedule = `From ${formatDate(courseResponse.data.START_DATE)} to ${formatDate(courseResponse.data.END_DATE)}`;
      const nextClass = (status === "active" || status === "upcoming") ? startDate.toISOString() : "";

      setCourseDetail({
        id: courseResponse.data.COURSE_ID,
        name: courseResponse.data.NAME,
        description: courseResponse.data.DESCRIPTION,
        students: courseResponse.data.NUMBER_STU,
        maxStudents: courseResponse.data.MAX_STU,
        price: courseResponse.data.PRICE,
        startDate: courseResponse.data.START_DATE,
        endDate: courseResponse.data.END_DATE,
        schedule,
        nextClass,
        status,
        syllabus: courseResponse.data.DESCRIPTION,
      });

      const assignmentsResponse = await MainApiRequest.get<{ assignments: BackendAssignment[] }>(`/assignment/getbycourse/${courseId}`);
      const fetchedAssignments = assignmentsResponse.data.assignments.map(assign => ({
        id: assign.AS_ID,
        title: assign.NAME,
        description: assign.DESCRIPTION,
        dueDate: assign.END_DATE,
        submissionsCount: Math.floor(Math.random() * (courseResponse.data.NUMBER_STU || 0) * 0.8), // Mock
        totalStudents: courseResponse.data.NUMBER_STU || 0,
        attachments: assign.FILENAME && assign.FILE ? [{
          id: 'file-' + assign.AS_ID,
          fileName: assign.FILENAME,
          fileSize: 'N/A',
          fileType: assign.FILENAME.split('.').pop() || 'other',
          downloadUrl: assign.FILE,
        }] : [],
      }));
      setAssignments(fetchedAssignments);

      const documentsResponse = await MainApiRequest.get<BackendDocument[]>(`/document/getbycourse/${courseId}`);
      const fetchedDocuments = documentsResponse.data.map(doc => ({
        id: doc.DOC_ID,
        title: doc.NAME,
        description: doc.DESCRIPTION,
        uploadDate: new Date().toISOString().split('T')[0],
        fileType: (doc.FILENAME?.split('.').pop() || 'other') as Document['fileType'],
        fileSize: 'N/A',
        downloadUrl: doc.FILE || '#',
      }));
      setDocuments(fetchedDocuments);

      const studentsResponse = await MainApiRequest.get<BackendStudent[]>(`/course/${courseId}/students`);
      const fetchedStudents = studentsResponse.data.map(student => ({
        id: student.ID,
        name: student.NAME,
        email: student.EMAIL,
        progress: Math.floor(Math.random() * 100),
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      setStudents(fetchedStudents);

    } catch (err) {
      console.error("Failed to fetch course details:", err);
      setError("Failed to load course details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleBack = () => {
    navigate("/teacher/course")
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const formatNextClass = (dateString: string) => {
    if (!dateString) return "No upcoming classes"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleAssignmentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setNewAssignment({ ...newAssignment, attachments: [...newAssignment.attachments, ...filesArray] })
    }
  }

  const removeAssignmentFile = (index: number) => {
    const updatedFiles = newAssignment.attachments.filter((_, i) => i !== index)
    setNewAssignment({ ...newAssignment, attachments: updatedFiles })
  }

  const handleCreateAssignment = async () => {
    setIsSubmitting(true)
    setError(null);

    if (!courseId) {
      setError("Course ID is missing for assignment creation.");
      setIsSubmitting(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('start_date', new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]); 
      formData.append('end_date', newAssignment.dueDate ? new Date(newAssignment.dueDate).toISOString().slice(0, 19).replace('T', ' ') : '');
      formData.append('course_id', courseId);
        
      if (newAssignment.attachments.length > 0) {
        formData.append('file', newAssignment.attachments[0]);
        formData.append('uploadedname', newAssignment.attachments[0].name);
      } else {
        formData.append('uploadedname', '');
      }

      const response = await MainApiRequest.post('/assignment/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdAssignment = response.data;

      fetchCourseData();
      setNewAssignment({ title: "", description: "", dueDate: "", attachments: [] });
      setIsNewAssignmentDialogOpen(false);
    } catch (err) {
      console.error("Failed to create assignment:", err);
      setError("Failed to create assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({ ...newDocument, file: e.target.files[0] })
    }
  }

  const handleUploadDocument = async () => {
    setIsSubmitting(true)
    setError(null);
    if (!courseId) {
      setError("Course ID is missing for document upload.");
      setIsSubmitting(false);
      return;
    }
    if (!newDocument.file) {
      setError("No file selected for upload.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newDocument.title);
      formData.append('description', newDocument.description);
      formData.append('course_id', courseId);
      formData.append('file', newDocument.file);
      formData.append('uploadedname', newDocument.file.name);

      const response = await MainApiRequest.post('/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdDocument = response.data;

      fetchCourseData();
      setNewDocument({ title: "", description: "", file: null });
      setIsNewDocumentDialogOpen(false);
    } catch (err) {
      console.error("Failed to upload document:", err);
      setError("Failed to upload document. Please try again.");
    } finally {
      setIsSubmitting(false);
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

  if (error) {
    return (
      <div className="course-not-found">
        <h2>Error Loading Course</h2>
        <p>{error}</p>
        <Button onClick={fetchCourseData}>Retry</Button>
        <Button onClick={handleBack} variant="outline" className="ml-2">Back to Courses</Button>
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
            <span>Next Class: {formatNextClass(courseDetail.nextClass || courseDetail.startDate)}</span>
          </div>
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
                  <div className="detail-item">
                    <strong>Price:</strong>
                    <span>{courseDetail.price.toLocaleString('vi-VN')} VND</span>
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
                      <p className="activity-text">{courseDetail.students} students currently enrolled</p>
                      <p className="activity-time">Updated recently</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <Calendar className="icon" />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">Course starts on {formatDate(courseDetail.startDate)}</p>
                      <p className="activity-time">Upcoming</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <Clock className="icon" />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">Course ends on {formatDate(courseDetail.endDate)}</p>
                      <p className="activity-time">Future</p>
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
                <TeacherAssignmentItem 
                  key={assignment.id} 
                  assignment={assignment} 
                  courseId={courseDetail.id} 
                />
              ))}
              {assignments.length === 0 && <p className="no-content">No assignments available</p>}
            </div>

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
                <TeacherDocumentItem 
                  key={document.id} 
                  document={document} 
                />
              ))}
              {documents.length === 0 && <p className="no-content">No materials available</p>}
            </div>

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
          </div>
        )}
      </Tabs>
    </div>
  )
}

export default TeacherCourseDetail;
