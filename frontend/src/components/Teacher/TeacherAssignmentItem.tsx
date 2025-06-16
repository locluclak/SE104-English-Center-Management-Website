"use client"

import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/Ui/Card/card"
import { Input } from "../../components/Ui/Input/input"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { Textarea } from "../../components/Ui/Textarea/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/Ui/Dialog/dialog"
import { FileText, Eye, Download, Trash } from "../../components/Ui/Icons/icons"
import { Edit } from "lucide-react"
import { GradingDialog } from "./GradingDialog"
import type { StudentSubmission, AssignmentAttachment, Assignment } from "../../types/teacher"
import { MainApiRequest } from "../../services/MainApiRequest"
import "./TeacherAssignmentItem.scss"


interface TeacherAssignmentItemProps {
  assignment: Assignment
  courseId: string
  isCourseCompleted: boolean;
  onRemoveFromUI?: (assignmentId: string) => void
  onUpdateAssignment?: (updatedAssignment: Assignment) => void;
}

export const TeacherAssignmentItem: React.FC<TeacherAssignmentItemProps> = ({
  assignment,
  courseId,
  onRemoveFromUI,
  onUpdateAssignment,
}) => {
  /* ---------- state ---------- */
  const [isViewSubmissionsDialogOpen, setIsViewSubmissionsDialogOpen] = useState(false)
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null)
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([])
  const attachments = assignment.attachments ?? []

  const [editForm, setEditForm] = useState({
    title: assignment.title,
    description: assignment.description,
    startDate: assignment.startDate.slice(0, 16), // Initialize with existing start date
    dueDate: assignment.dueDate.slice(0, 16), // "YYYY-MM-DDTHH:mm"
    attachments: [] as File[],
  })


  /* ---------- fetch submissions when dialog mở ---------- */
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

  /* ---------- helper ---------- */
  const formatDate = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleDateString("vi-VN") : "N/A"

  const getSubmissionStatusColor = (status: string) =>
    ({
      submitted: "status-submitted",
      graded: "status-graded",
      late: "status-late",
    } as Record<string, string>)[status] ?? "status-default"

  /* ---------- actions ---------- */
  const handleGradeSubmission = (submission: StudentSubmission) => {
    setSelectedSubmission(submission)
    setIsGradingDialogOpen(true)
  }

  const handleGradeSubmit = async (submissionId: string, grade: number, feedback: string) => {
    const submission = submissions.find((s) => s.id === submissionId)
    if (!submission) return
    try {
      await MainApiRequest.put(
        `/submission/score/${submission.studentId}/${assignment.id}`,
        { score: grade },
      )
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId ? { ...s, grade, feedback, status: "graded" as const } : s,
        ),
      )
    } catch (err) {
      console.error("Chấm điểm thất bại:", err)
    }
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setEditForm((prev) => ({
        ...prev,
        attachments: Array.from(files),
      }))
    }
  }

  const removeEditFile = (index: number) => {
    const newFiles = [...editForm.attachments]
    newFiles.splice(index, 1)
    setEditForm((prev) => ({
      ...prev,
      attachments: newFiles,
    }))
  }

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData()
      formData.append("title", editForm.title)
      formData.append("description", editForm.description)
      formData.append("startDate", editForm.startDate) // Include startDate
      formData.append("dueDate", editForm.dueDate)
      formData.append("courseId", courseId)

      editForm.attachments.forEach((file) => {
        formData.append("attachments", file)
      })

      const response = await MainApiRequest.put(`/assignment/update/${assignment.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      if (response.status === 200) {
        const updatedAssignmentData = {
          ...assignment,
          title: editForm.title,
          description: editForm.description,
          startDate: editForm.startDate,
          dueDate: editForm.dueDate, // Cập nhật dueDate ở đây
          // Bạn có thể cần xử lý lại attachments nếu API trả về danh sách file mới
        };
      if (onUpdateAssignment) {
          onUpdateAssignment(updatedAssignmentData);
        } 
        setIsEditDialogOpen(false) // Đóng dialog
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật assignment:", error)
    }
  }


  const handleDownloadAttachment = (attachment: AssignmentAttachment) =>
    window.open(attachment.downloadUrl, "_blank")

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

  /* ---------- UI ---------- */
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
          {/* Attachments */}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment)}
                    >
                      <Download className="icon" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
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
                style={{
                  width: `${(submissions.length / assignment.totalStudents) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="assignment-actions">
            {/* Trái */}
            <div className="left-actions">
              <Button onClick={() => setIsViewSubmissionsDialogOpen(true)}>
                <Eye className="icon" />
                View Submissions
              </Button>
            </div>

            {/* Phải */}
            <div className="right-actions">
              <Button
                variant="outline"
                className="edit-btn"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit size={16} className="icon" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="delete-btn"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="icon" />
                Delete
              </Button>
            </div>
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
              Are you sure you want to delete **{assignment.title}**? This action
              cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAssignment}
              disabled={isDeleting}
              loading={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Submissions Dialog */}
      <Dialog
        open={isViewSubmissionsDialogOpen}
        onOpenChange={setIsViewSubmissionsDialogOpen}
      >
        <DialogContent className="submissions-dialog">
          <DialogHeader>
            <DialogTitle>Submissions: {assignment.title}</DialogTitle>
          </DialogHeader>

          <div className="submissions-list">
            {/* header */}
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
                  <Badge className={getSubmissionStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                </div>
                <div className="submission-grade">
                  {submission.grade !== undefined
                    ? `${submission.grade}/${submission.maxGrade}`
                    : "Not graded"}
                </div>
                <div className="submission-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGradeSubmission(submission)}
                  >
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update assignment information and re-upload files if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="dialog-form">
            <div className="form-field">
              <label>Title</label>
              <Input
                placeholder="Assignment title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <Textarea
                placeholder="Assignment description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            {/* New: Start Date field */}
            <div className="form-field">
              <label>Start Date</label>
              <Input
                type="datetime-local"
                value={editForm.startDate}
                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Due Date</label>
              <Input
                type="datetime-local"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Replace Attachments (Optional)</label>
              <Input type="file" multiple onChange={handleEditFileChange} />
              {editForm.attachments && editForm.attachments.length > 0 && (
                <div className="attached-files">
                  <h5>New Attached Files:</h5>
                  {editForm.attachments.map((file, index) => (
                    <div key={index} className="attached-file-item">
                      <div className="file-info">
                        <FileText className="icon" />
                        <div className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeEditFile(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}