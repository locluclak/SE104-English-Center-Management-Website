"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Users } from "../../components/Ui/Icons/icons"
import "./TeacherStudentItem.scss"

interface Student {
  id: string
  name: string
  email: string
  progress: number
  lastActivity: string
}

interface TeacherStudentItemProps {
  student: Student
  courseId: string
}

export const TeacherStudentItem: React.FC<TeacherStudentItemProps> = ({ student, courseId }) => {
  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else {
      return `${diffDays} days ago`
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "progress-high"
    if (progress >= 60) return "progress-medium"
    return "progress-low"
  }

  return (
    <Card className="student-item">
      <CardHeader>
        <div className="student-header">
          <div className="student-avatar">
            <Users className="avatar-icon" />
          </div>
          <div className="student-info">
            <CardTitle>{student.name}</CardTitle>
            <CardDescription>{student.email}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="student-details">
          <div className="detail-row">
            <span>Last Activity:</span>
            <span>{formatLastActivity(student.lastActivity)}</span>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Course Progress</span>
              <span>{student.progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${getProgressColor(student.progress)}`}
                style={{ width: `${student.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="student-actions">
          <Button variant="outline">View Details</Button>
          <Button>Send Message</Button>
        </div>
      </CardContent>
    </Card>
  )
}
