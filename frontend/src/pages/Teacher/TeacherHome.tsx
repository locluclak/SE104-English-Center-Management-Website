"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { BookOpen, Users, Calendar, Clock } from "../../components/Ui/Icons/icons"

interface AssignmentDeadline {
  id: string
  title: string
  description: string
  dueDate: string
  dueTime: string
  courseId: string
  courseName: string
  studentsCount: number
  submissionsCount: number
}

interface TeacherHomeProps {
  teacherId: string
  userRole: string
}

const TeacherHome: React.FC<TeacherHomeProps> = ({ teacherId, userRole }) => {
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<AssignmentDeadline[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)

    setTimeout(() => {
      const mockAssignments: AssignmentDeadline[] = [
        {
          id: "1",
          title: "Bài tập Toán học Chương 3",
          description: "Bài tập đại số tuyến tính",
          dueDate: "2025-06-20",
          dueTime: "23:59",
          courseId: "1",
          courseName: "Toán học 101",
          studentsCount: 25,
          submissionsCount: 18,
        },
        {
          id: "2",
          title: "Báo cáo thí nghiệm Vật lý",
          description: "Phân tích chuyển động con lắc",
          dueDate: "2025-06-25",
          dueTime: "23:59",
          courseId: "2",
          courseName: "Vật lý 101",
          studentsCount: 20,
          submissionsCount: 12,
        },
        {
          id: "3",
          title: "Luận văn Hóa học",
          description: "Nghiên cứu hợp chất hữu cơ",
          dueDate: "2025-06-30",
          dueTime: "23:59",
          courseId: "3",
          courseName: "Hóa học 101",
          studentsCount: 22,
          submissionsCount: 5,
        },
      ]
      setUpcomingDeadlines(mockAssignments.filter((assignment) => {
        const assignmentDate = new Date(assignment.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return assignmentDate >= today;
      }));

      setLoading(false)
    }, 500)
  }, [teacherId])

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="teacher-home">
      <div className="page-header">
        <h1>Teacher Dashboard</h1>
        <p>Welcome back!</p>
      </div>

      {/* Assignment Deadlines Overview */}
      {upcomingDeadlines.length > 0 ? (
        <Card className="deadlines-overview mb-6">
          <div className="deadlines-header">
            <h3 className="text-lg font-semibold text-orange-800">Hạn nộp bài tập & Tình trạng nộp bài</h3>
          </div>
          <div className="deadlines-list">
            {upcomingDeadlines.slice(0, 3).map((deadline) => (
              <div key={deadline.id} className="deadline-item">
                <div className="deadline-info">
                  <div className="deadline-title">{deadline.title}</div>
                  <div className="deadline-course">{deadline.courseName}</div>
                </div>
                <div className="deadline-stats">
                  <div className="deadline-date">{new Date(deadline.dueDate).toLocaleDateString("vi-VN")}</div>
                  <div className="submission-progress">
                    <span className="submitted">{deadline.submissionsCount}</span>
                    <span className="separator">/</span>
                    <span className="total">{deadline.studentsCount}</span>
                    <span className="label">đã nộp</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${((deadline.submissionsCount || 0) / (deadline.studentsCount || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="empty-state">
          <BookOpen className="empty-icon" /> {/* Using BookOpen as a general empty icon */}
          <h3>No upcoming assignment deadlines</h3>
          <p>There are no assignments with upcoming deadlines to display at the moment.</p>
        </div>
      )}
    </div>
  )
}

export default TeacherHome