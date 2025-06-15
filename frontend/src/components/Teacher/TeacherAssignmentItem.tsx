"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/Ui/Dialog/dialog"
import { FileText, Eye, Download, Trash } from "../../components/Ui/Icons/icons"
import { GradingDialog } from "./GradingDialog"
import type { StudentSubmission, AssignmentAttachment } from "../../types/teacher"
import { MainApiRequest } from "../../services/MainApiRequest"
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
  onRemoveFromUI?: (assignmentId: string) => void
}

export const TeacherAssignmentItem: React.FC<TeacherAssignmentItemProps> = ({ assignment, courseId, onRemoveFromUI }) => {
  const [isViewSubmissionsDialogOpen, setIsViewSubmissionsDialogOpen] = useState(false)
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null)
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([])
  const attachments = assignment.attachments ?? []

  useEffect(() => {
    if (!isViewSubmissionsDialogOpen) return

    const fetchSubmissions = async () => {
      try {
        const res = await MainApiRequest.get(`/submission/submissions_byassignment/${assignment.id}`)
        if (res.data.submissions) {
          const transformed = res.data.submissions.map((item: any) => ({
            id: `${item.STUDENT_ID}`,
            studentName: item.STUDENT_NAME,
            studentId: item.STUDENT_ID,
            submittedAt: item.SUBMIT_DATE,
            grade: item.SCORE ?? undefined,
            maxGrade: 100,
            status: item.SCORE !== null ? "graded" : "submitted",
            submissionText: item.SUBMISSION_DESCRIPTION || "",
            attachments: item.SUBMISSION_FILE
              ? [
                  {
                    id: `${item.STUDENT_ID}-file`,
                    fileName: "Submission File",
                    fileSize: "unknown",
                    downloadUrl: item.SUBMISSION_FILE,
                  },
                ]
              : [],
          }))
          setSubmissions(transformed)
        }
      } catch (err) {
        console.error("Lỗi khi lấy submissions:", err)
      }
    }

    fetchSubmissions()
  }, [isViewSubmissionsDialogOpen, assignment.id])

  const handleGradeSubmission = (submission: StudentSubmission) => {
    setSelectedSubmission(submission)
    setIsGradingDialogOpen(true)
  }

  const handleGradeSubmit = async (submissionId: string, grade: number, feedback: string) => {
    const submission = submissions.find((s) => s.id === submissionId)
    if (!submission) return

    try {
      await MainApiRequest.put(`/submission/score/${submission.studentId}/${assignment.id}`, {
        score: grade,
      })

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId ? { ...s, grade, feedback, status: "graded" as const } : s
        )
      )
    } catch (err) {
      console.error("Chấm điểm thất bại:", err)
    }
  }

  const handleDownloadAttachment = (attachment: AssignmentAttachment) => {
    window.open(attachment.downloadUrl, "_blank")
  }

  const handleDeleteAssignment = async () => {
    setIsDeleting(true)
    try {
      await MainApiRequest.delete(`/assignment/delete/${assignment.id}`)
      onRemoveFromUI?.(assignment.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Lỗi xoá assignment:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  return (
    <>
      <Card className="assignment-item">
        <CardHeader>
          <div className="assignment-header">
            <div className="assignment-title-section">
              <FileText className="icon" />
              <CardTitle>{assignment.title}</CardTitle>
            </div>
            <Badge>Due: {formatDate(assignment.dueDate)}</Badge>
          </div>
          <CardDescription>{assignment.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {attachments.length > 0 && (
            <div className="assignment-attachments">
              <h4>Assignment Files:</h4>
              <div className="attachments-list">
                {attachments.map((attachment) => (
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
                {submissions.length}/{assignment.totalStudents}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(submissions.length / assignment.totalStudents) * 100}%` }}
              />
            </div>
          </div>

          <div className="assignment-actions">
            <Button onClick={() => setIsViewSubmissionsDialogOpen(true)}>
              <Eye className="icon" />
              View Submissions
            </Button>
            <Button variant="outline" className="delete-btn" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className="icon" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
          </DialogHeader>
          <div className="delete-confirmation">
            <p>
              Are you sure you want to delete <strong>{assignment.title}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAssignment} disabled={isDeleting} loading={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <div className="submission-date">{formatDate(submission.submittedAt)}</div>
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

      <GradingDialog
        open={isGradingDialogOpen}
        onOpenChange={setIsGradingDialogOpen}
        submission={selectedSubmission}
        onGradeSubmit={handleGradeSubmit}
      />
    </>
  )
}