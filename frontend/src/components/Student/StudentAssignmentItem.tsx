"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "../../components/Ui/Dialog/dialog"
import { Textarea } from "../../components/Ui/Textarea/textarea"
import { Input } from "../../components/Ui/Input/input"
import { FileText, Upload } from "../../components/Ui/Icons/icons"
import { MainApiRequest } from "@/services/MainApiRequest"
import { message } from "antd"
import "./StudentAssignmentItem.scss"

interface Submission {
  STUDENT_ID: string
  SUBMIT_DATE: string
  SUBMISSION_DESCRIPTION: string
  SUBMISSION_FILE?: string
  SCORE?: number
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

interface StudentAssignmentItemProps {
  assignment: Assignment
  courseId: string
  onStatusChange?: (status: string) => void
}

export const StudentAssignmentItem: React.FC<StudentAssignmentItemProps> = ({ assignment, courseId, onStatusChange }) => {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [submissionText, setSubmissionText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submitting, setSubmitting] = useState(false)

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`
  }

  const fetchSubmissions = async () => {
  try {
    const token = localStorage.getItem("token")
    const studentId = token ? JSON.parse(token).id : null
    if (!studentId) return

    const res = await MainApiRequest.get(`/submission/submissions_byassignment/${assignment.id}`)

    const filtered = (res.data.submissions || []).filter(
      (s: Submission) => s.STUDENT_ID === studentId
    )

    setSubmissions(filtered)

    if (filtered.length > 0 && assignment.status === "pending") {
      assignment.status = "submitted"
      onStatusChange?.("submitted")
    }
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // Không có submission => không sao cả
      setSubmissions([])
    } else {
      console.error("Lỗi khi lấy submission:", err)
      message.error("Đã xảy ra lỗi khi tải bài nộp.")
    }
  }
}



  useEffect(() => {
    fetchSubmissions()
  }, [assignment.id])

  const handleEditSubmission = () => {
    const latest = submissions[submissions.length - 1]
    setSubmissionText(latest.SUBMISSION_DESCRIPTION || "")
    setSelectedFile(null)
    setIsSubmitDialogOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const studentId = token ? JSON.parse(token).id : null
      if (!studentId) throw new Error("Student ID not found")

      const latest = submissions[submissions.length - 1]
      const isEditable = latest && latest.SCORE == null

      const formData = new FormData()
      formData.append("description", submissionText)
      if (selectedFile) formData.append("file", selectedFile)

      if (isEditable) {
        await MainApiRequest.put(`/submission/update/${studentId}/${assignment.id}`, formData, {headers: { "Content-Type": "multipart/form-data" },})
      } else {
        formData.append("student_id", studentId)
        formData.append("assignment_id", assignment.id)
        await MainApiRequest.post(`/submission/upload`, formData, {headers: { "Content-Type": "multipart/form-data" }})
        assignment.status = "submitted"
        onStatusChange?.("submitted")
      }

      if (selectedFile) {
        const docForm = new FormData()
        docForm.append("name", `${assignment.title} - ${studentId}`)
        docForm.append("description", submissionText || "Assignment submission")
        docForm.append("course_id", courseId)
        docForm.append("file", selectedFile)

        await MainApiRequest.post("/document", docForm, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      message.success("Submission and document saved successfully!")
      setIsSubmitDialogOpen(false)
      fetchSubmissions()
    } catch (error) {
      console.error("Error submitting:", error)
      message.error("Submission failed.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "status-pending"
      case "submitted": return "status-submitted"
      case "graded": return "status-graded"
      default: return "status-default"
    }
  }

  const isOverdue = () => {
    const due = new Date(assignment.dueDate)
    return due < new Date() && assignment.status === "pending"
  }

  const latestUnscored = submissions[submissions.length - 1]
  const canEdit = submissions.length > 0 && (submissions[submissions.length - 1].SCORE === undefined || submissions[submissions.length - 1].SCORE === null)
  const hasSubmission = submissions.length > 0

  return (
    <Card className={`assignment-item ${isOverdue() ? "overdue" : ""}`}>
      <CardHeader>
        <div className="assignment-header">
          <div className="assignment-title-section">
            <FileText className="icon" />
            <CardTitle>{assignment.title}</CardTitle>
          </div>
          <Badge className={getStatusColor(assignment.status)}>
            {isOverdue() ? "Overdue" : assignment.status}
          </Badge>
        </div>
        <CardDescription>
          Due: {formatDateTime(assignment.dueDate)}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="assignment-description">{assignment.description}</p>
        <div className="assignment-actions">
          {assignment.status === "pending" && (
            <Button onClick={() => setIsSubmitDialogOpen(true)}>
              <Upload className="icon" /> Submit Assignment
            </Button>
          )}
            <div className="submission-buttons">
          {hasSubmission && (
            <>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(true)} className="mr-2">
                View Submission
              </Button>
              {canEdit && (
                <Button variant="default" onClick={handleEditSubmission}>
                  Edit Submission
                </Button>
              )}
            </>
          )}
    
          {assignment.status === "graded" && assignment.grade !== undefined && (
            <div className="grade-display">
              <span>Grade: </span>
              <strong>{assignment.grade}/100</strong>
            </div>
          )}
          </div>
        </div>
      </CardContent>

      {/* Submit / Edit Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {canEdit
                ? "Edit Your Submission"
                : `Submit Assignment: ${assignment.title}`}
            </DialogTitle>
          </DialogHeader>
          <div className="submission-form">
            <div className="form-field">
              <label>Your Answer</label>
              <Textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
            <div className="form-field">
              <label>Upload File (Optional)</label>
              <Input type="file" onChange={handleFileChange} />
              {selectedFile && (
                <div className="selected-file">
                  <span>Selected: {selectedFile.name}</span>
                  <span className="file-size">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || (!submissionText.trim() && !selectedFile)}
              loading={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Submission: {assignment.title}</DialogTitle>
          </DialogHeader>
          <div className="submission-view">
            {hasSubmission ? (
              submissions.map((sub, idx) => (
                <div
                  key={`${sub.STUDENT_ID}-${idx}`}
                  className="submission-section"
                >
                  <h4>Submission #{idx + 1}</h4>
                  <p>
                    <strong>Submitted at:</strong>{" "}
                    {formatDateTime(sub.SUBMIT_DATE)}
                  </p>
                  <p>{sub.SUBMISSION_DESCRIPTION || "(No description)"}</p>
                  {sub.SUBMISSION_FILE && (
                    <div className="attached-file">
                      <FileText className="icon" />
                      <a
                        href={sub.SUBMISSION_FILE}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {sub.SUBMISSION_FILE.split("/").pop()}
                      </a>
                    </div>
                  )}
                  {sub.SCORE !== undefined ? (
                    <p>
                      <strong>Score:</strong> {sub.SCORE}/100
                    </p>
                  ) : (
                    <p>
                      <em>Not graded yet</em>
                    </p>
                  )}
                  <hr />
                </div>
              ))
            ) : (
              <p>You haven't submitted this assignment yet.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
