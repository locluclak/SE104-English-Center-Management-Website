"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { BookOpen, Users, Calendar, Clock } from "../../components/Ui/Icons/icons"
import { MainApiRequest } from "@/services/MainApiRequest"

interface BackendAssignmentDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId: string;
  courseName: string;
  studentsCount: number;
  submissionsCount: number;
}

interface TeacherHomeProps {
  teacherId: string
  userRole: string
}

const TeacherHome: React.FC<TeacherHomeProps> = ({ teacherId, userRole }) => {
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<BackendAssignmentDeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchUpcomingDeadlines = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!teacherId) {
      setError("Teacher ID is missing. Cannot fetch upcoming deadlines.");
      setLoading(false);
      return;
    }

    try {
      const response = await MainApiRequest.get<BackendAssignmentDeadline[]>(`/assignment/teacher/${teacherId}/progress`);
      setUpcomingDeadlines(response.data);
    } catch (err) {
      console.error("Failed to fetch upcoming deadlines:", err);
      setError("Failed to load upcoming deadlines. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchUpcomingDeadlines();
  }, [fetchUpcomingDeadlines]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <Button onClick={fetchUpcomingDeadlines}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="teacher-home">
      <div className="page-header">
        <h1>Teacher Dashboard</h1>
        <p>Welcome back!</p>
      </div>

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
          <BookOpen className="empty-icon" />
          <h3>No upcoming assignment deadlines</h3>
          <p>There are no assignments with upcoming deadlines to display at the moment.</p>
        </div>
      )}
    </div>
  )
}

export default TeacherHome
