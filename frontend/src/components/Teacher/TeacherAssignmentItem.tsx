"use client"

import React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/Ui/Dialog/dialog"
import { FileText, Eye, Download } from "../../components/Ui/Icons/icons"
import { GradingDialog } from "./GradingDialog"
import type { StudentSubmission, AssignmentAttachment } from "../../types/teacher"
import "./TeacherAssignmentItem.scss"

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  submissionsCount: number
  totalStudents: number
  attachments?: AssignmentAttachment[]
}

interface TeacherAssignmentItemProps {
  assignment: Assignment
  courseId: string
}

export const TeacherAssignmentItem: React.FC<TeacherAssignmentItemProps> = ({ assignment, courseId }) => {
  const [isViewSubmissionsDialogOpen, setIsViewSubmissionsDialogOpen] = useState(false)
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null)
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([])

  // Mock submissions data
  React.useEffect(() => {
    setSubmissions([
      {
        id: "s1",
        studentName: "John Doe",
        studentId: "ST001",
        studentEmail: "john.doe@example.com",
        submittedAt: "2024-01-14T10:30:00",
        status: "submitted",
        grade: undefined,
        maxGrade: 100,
        submissionText:
          "This is my answer to the assignment. I have completed all the required problems and shown my work step by step.",
        attachments: [
          {
            id: "att1",
            fileName: "homework_solution.pdf",
            fileSize: "2.3 MB",
            downloadUrl: "/files/homework_solution.pdf",
          },
        ],
      },
      {
        id: "s2",
        studentName: "Jane Smith",
        studentId: "ST002",
        studentEmail: "jane.smith@example.com",
        submittedAt: "2024-01-13T15:45:00",
        status: "graded",
        grade: 85,
        maxGrade: 100,
        feedback: "Good work! Your solution is correct but could be more detailed in step 3.",
        submissionText: "Here is my complete solution with detailed explanations for each step.",
        attachments: [
          {
            id: "att2",
            fileName: "assignment_answers.docx",
            fileSize: "1.8 MB",
            downloadUrl: "/files/assignment_answers.docx",
          },
        ],
      },
      {
        id: "s3",
        studentName: "Michael Johnson",
        studentId: "ST003",
        studentEmail: "michael.johnson@example.com",
        submittedAt: "2024-01-15T23:30:00", // Late submission
        status: "late",
        grade: undefined,
        maxGrade: 100,
        submissionText: "Sorry for the late submission. Here is my completed assignment.",
        attachments: [],
      },
    ])
  }, [])

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatSubmissionDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "status-submitted"
      case "graded":
        return "status-graded"
      case "late":
        return "status-late"
      default:
        return "status-default"
    }
  }

  const handleGradeSubmission = (submission: StudentSubmission) => {
    setSelectedSubmission(submission)
    setIsGradingDialogOpen(true)
  }

  const handleGradeSubmit = (submissionId: string, grade: number, feedback: string) => {
    // Update the submission with the new grade and feedback
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === submissionId ? { ...sub, grade, feedback, status: "graded" as const } : sub)),
    )
    console.log(`Graded submission ${submissionId}: ${grade}/100`)
  }

  const handleDownloadAttachment = (attachment: AssignmentAttachment) => {
    console.log(`Downloading assignment attachment: ${attachment.fileName}`)
    window.open(attachment.downloadUrl, "_blank")
  }

  return (
    <>
      <Card className="assignment-item">
        <CardHeader>
          <div className="assignment-header">
            <div className="assignment-title-section">
              <FileText className="icon" />
              <CardTitle>{assignment.title}</CardTitle>
            </div>
            <Badge>Due: {formatDueDate(assignment.dueDate)}</Badge>
          </div>
          <CardDescription>{assignment.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Assignment Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="assignment-attachments">
              <h4>Assignment Files:</h4>
              <div className="attachments-list">
                {assignment.attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment-item">
                    <div className="attachment-info">
                      <FileText className="icon" />
                      <div className="file-details">
                        <span className="file-name">{attachment.fileName}</span>
                        <span className="file-size">{attachment.fileSize}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadAttachment(attachment)}>
                      <Download className="icon" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div className="assignment-actions">
            <Button onClick={() => setIsViewSubmissionsDialogOpen(true)}>
              <Eye className="icon" />
              View Submissions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Submissions Dialog */}
      <Dialog open={isViewSubmissionsDialogOpen} onOpenChange={setIsViewSubmissionsDialogOpen}>
        <DialogContent className="submissions-dialog">
          <DialogHeader>
            <DialogTitle>Submissions: {assignment.title}</DialogTitle>
          </DialogHeader>

          <div className="submissions-list">
            <div className="submissions-header">
              <span>Student</span>
              <span>Submitted</span>
              <span>Status</span>
              <span>Grade</span>
              <span>Actions</span>
            </div>

            {submissions.map((submission) => (
              <div key={submission.id} className="submission-item">
                <div className="student-info">
                  <span className="student-name">{submission.studentName}</span>
                  <span className="student-id">{submission.studentId}</span>
                </div>
                <div className="submission-date">{formatSubmissionDate(submission.submittedAt)}</div>
                <div className="submission-status">
                  <Badge className={getSubmissionStatusColor(submission.status)}>{submission.status}</Badge>
                </div>
                <div className="submission-grade">
                  {submission.grade !== undefined ? `${submission.grade}/${submission.maxGrade}` : "Not graded"}
                </div>
                <div className="submission-actions">
                  <Button variant="outline" size="sm" onClick={() => handleGradeSubmission(submission)}>
                    {submission.status === "graded" ? "Edit Grade" : "Grade"}
                  </Button>
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="no-submissions">
                <p>No submissions yet</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsViewSubmissionsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grading Dialog */}
      <GradingDialog
        open={isGradingDialogOpen}
        onOpenChange={setIsGradingDialogOpen}
        submission={selectedSubmission}
        onGradeSubmit={handleGradeSubmit}
      />
    </>
  )
}
