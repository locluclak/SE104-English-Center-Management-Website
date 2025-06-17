"use client"

import React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/Ui/Dialog/dialog"
import { Button } from "../../components/Ui/Button/button"
import { Input } from "../../components/Ui/Input/input"
import { Textarea } from "../../components/Ui/Textarea/textarea"
import { Badge } from "../../components/Ui/Badge/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { FileText, Download } from "../../components/Ui/Icons/icons"
import type { StudentSubmission } from "../../types/teacher"
import "./GradingDialog.scss"

interface GradingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: StudentSubmission | null
  onGradeSubmit: (submissionId: string, grade: number, feedback: string) => void
}

export const GradingDialog: React.FC<GradingDialogProps> = ({ open, onOpenChange, submission, onGradeSubmit }) => {
  const [grade, setGrade] = useState<string>("")
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  React.useEffect(() => {
    if (submission) {
      setGrade(submission.grade?.toString() || "")
      setFeedback(submission.feedback || "")
    }
  }, [submission])

  const handleSubmit = () => {
    if (!submission) return

    const gradeNumber = Number.parseFloat(grade)
    if (isNaN(gradeNumber) || gradeNumber < 0 || gradeNumber > submission.maxGrade) {
      alert(`Grade must be between 0 and ${submission.maxGrade}`)
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      onGradeSubmit(submission.id, gradeNumber, feedback)
      setIsSubmitting(false)
      onOpenChange(false)
    }, 1000)
  }

  const handleDownload = (attachment: any) => {
    console.log(`Downloading: ${attachment.fileName}`)
    window.open(attachment.downloadUrl, "_blank")
  }

  const formatSubmissionDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusColor = (status: string) => {
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

  if (!submission) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grading-dialog">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
        </DialogHeader>

        <div className="grading-content">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="student-info">
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">{submission.studentName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Student ID:</span>
                  <span className="value">{submission.studentId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{submission.studentEmail}</span>
                </div>
                <div className="info-row">
                  <span className="label">Submitted:</span>
                  <span className="value">{formatSubmissionDate(submission.submittedAt)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Content */}
          <Card>
            <CardHeader>
              <CardTitle>Submission</CardTitle>
            </CardHeader>
            <CardContent>
              {submission.submissionText && (
                <div className="submission-text">
                  <h4>Answer:</h4>
                  <div className="text-content">{submission.submissionText}</div>
                </div>
              )}

              {submission.attachments && submission.attachments.length > 0 && (
                <div className="submission-attachments">
                  <h4>Attached Files:</h4>
                  <div className="attachments-list">
                    {submission.attachments.map((attachment) => (
                      <div key={attachment.id} className="attachment-item">
                        <div className="attachment-info">
                          <FileText className="icon" />
                          <div className="file-details">
                            <span className="file-name">{attachment.fileName}</span>
                            <span className="file-size">{attachment.fileSize}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(attachment)}>
                          <Download className="icon" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grading Section */}
          <Card>
            <CardHeader>
              <CardTitle>Grading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grading-form">
                <div className="grade-input">
                  <label>Grade (out of {submission.maxGrade})</label>
                  <Input
                    type="number"
                    min="0"
                    max={submission.maxGrade}
                    step="0.1"
                    placeholder={`Enter grade (0-${submission.maxGrade})`}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />
                </div>

                <div className="feedback-input">
                  <label>Feedback (Optional)</label>
                  <Textarea
                    placeholder="Provide feedback to the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !grade} loading={isSubmitting}>
            {isSubmitting ? "Saving Grade..." : "Save Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
