"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/Ui/Dialog/dialog"
import { Textarea } from "../../components/Ui/Textarea/textarea"
import { Input } from "../../components/Ui/Input/input"
import { FileText, Upload } from "../../components/Ui/Icons/icons"
import "./StudentAssignmentItem.scss"

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
}

export const StudentAssignmentItem: React.FC<StudentAssignmentItemProps> = ({ assignment, courseId }) => {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [submissionText, setSubmissionText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    setSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Submitting assignment:", {
        assignmentId: assignment.id,
        courseId,
        text: submissionText,
        file: selectedFile ? selectedFile.name : "No file",
      })

      setSubmitting(false)
      setIsSubmitDialogOpen(false)

      // In a real app, you would update the assignment status after successful submission
      // For now, we'll just log the submission
    }, 1000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending"
      case "submitted":
        return "status-submitted"
      case "graded":
        return "status-graded"
      default:
        return "status-default"
    }
  }

  const isOverdue = () => {
    const dueDate = new Date(assignment.dueDate)
    const now = new Date()
    return dueDate < now && assignment.status === "pending"
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className={`assignment-item ${isOverdue() ? "overdue" : ""}`}>
      <CardHeader>
        <div className="assignment-header">
          <div className="assignment-title-section">
            <FileText className="icon" />
            <CardTitle>{assignment.title}</CardTitle>
          </div>
          <Badge className={getStatusColor(assignment.status)}>{isOverdue() ? "Overdue" : assignment.status}</Badge>
        </div>
        <CardDescription>Due: {formatDueDate(assignment.dueDate)}</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="assignment-description">{assignment.description}</p>

        <div className="assignment-actions">
          {assignment.status === "pending" && (
            <Button onClick={() => setIsSubmitDialogOpen(true)}>
              <Upload className="icon" />
              Submit Assignment
            </Button>
          )}

          {assignment.status !== "pending" && (
            <Button variant="outline" onClick={() => setIsViewDialogOpen(true)}>
              View Submission
            </Button>
          )}

          {assignment.status === "graded" && assignment.grade !== undefined && (
            <div className="grade-display">
              <span>Grade: </span>
              <strong>{assignment.grade}/100</strong>
            </div>
          )}
        </div>
      </CardContent>

      {/* Submit Assignment Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment: {assignment.title}</DialogTitle>
          </DialogHeader>

          <div className="submission-form">
            <div className="form-field">
              <label>Your Answer</label>
              <Textarea
                placeholder="Type your answer here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Upload File (Optional)</label>
              <Input type="file" onChange={handleFileChange} />
              {selectedFile && (
                <div className="selected-file">
                  <span>Selected: {selectedFile.name}</span>
                  <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
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
            <div className="submission-section">
              <h4>Your Answer</h4>
              <p className="submission-text">
                {/* In a real app, this would show the actual submission */}
                This is a sample submission text. In a real application, this would display the actual text that was
                submitted for this assignment.
              </p>
            </div>

            <div className="submission-section">
              <h4>Attached Files</h4>
              <div className="attached-file">
                <FileText className="icon" />
                <span>assignment1_solution.pdf</span>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>

            {assignment.status === "graded" && (
              <div className="submission-section">
                <h4>Feedback</h4>
                <div className="feedback-container">
                  <div className="grade">
                    <span>Grade:</span>
                    <strong>{assignment.grade}/100</strong>
                  </div>
                  <p className="feedback-text">{assignment.feedback || "No feedback provided."}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
