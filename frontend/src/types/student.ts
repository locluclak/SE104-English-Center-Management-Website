export interface Student {
  id: string
  name: string
  email: string
  role: "ROLE_STUDENT"
}

export interface Course {
  id: string
  name: string
  description: string
  instructor: string
  schedule: string
  enrolled: number
  maxStudents: number
  status: "active" | "completed" | "paused"
  progress?: number
}

export interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  dueDate: string
  status: "pending" | "submitted" | "graded"
  grade?: number
}

export interface CalendarEvent {
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

export interface PadletAttachment {
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
