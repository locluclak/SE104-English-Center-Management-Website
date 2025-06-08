export interface Teacher {
  id: string
  name: string
  email: string
  role: "ROLE_TEACHER"
}

export interface TeacherCourse {
  id: string
  name: string
  description: string
  students: number
  maxStudents: number
  schedule: string
  nextClass: string
  status: "active" | "completed" | "paused"
}

export interface TeacherAssignment {
  id: string
  title: string
  description: string
  dueDate: string
  submissionsCount: number
  totalStudents: number
  attachments?: AssignmentAttachment[]
}

export interface AssignmentAttachment {
  id: string
  fileName: string
  fileSize: string
  fileType: string
  downloadUrl: string
}

export interface StudentSubmission {
  id: string
  studentName: string
  studentId: string
  studentEmail: string
  submittedAt: string
  status: "submitted" | "graded" | "late"
  grade?: number
  maxGrade: number
  feedback?: string
  submissionText?: string
  attachments?: SubmissionAttachment[]
}

export interface SubmissionAttachment {
  id: string
  fileName: string
  fileSize: string
  downloadUrl: string
}

export interface TeacherDocument {
  id: string
  title: string
  description: string
  uploadDate: string
  fileType: "pdf" | "doc" | "ppt" | "image" | "video" | "other"
  fileSize: string
  downloadUrl: string
}

export interface TeacherStudent {
  id: string
  name: string
  email: string
  progress: number
  lastActivity: string
}

export interface TeacherCalendarEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: "class" | "assignment" | "exam" | "meeting"
  courseId?: string
  courseName?: string
}

export interface TeacherPadletAttachment {
  id: string
  title: string
  description: string
  fileName: string
  fileSize: string
  uploadDate: string
  courseId: string
  courseName: string
  type: "document" | "image" | "video" | "audio" | "other"
  downloadUrl: string
}
