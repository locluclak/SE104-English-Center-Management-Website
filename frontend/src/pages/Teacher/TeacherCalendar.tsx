"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "antd"
import { Button } from "@/components/Ui/Button/button"
import { Select, SelectItem } from "@/components/Ui/Select/Select"
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from "lucide-react"

import "./TeacherCalendar.scss"

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

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: "class" | "assignment" | "exam" | "meeting" | "deadline"
  courseId?: string
  courseName?: string
  isDeadline?: boolean
  studentsCount?: number
  submissionsCount?: number
}

interface TeacherCalendarProps {
  teacherId: string
  userRole: string
}

const TeacherCalendar: React.FC<TeacherCalendarProps> = ({ teacherId, userRole }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCourse, setSelectedCourse] = useState<string>("all")

  useEffect(() => {
    // Mock data - assignments from courses taught by teacher
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

    // Convert assignments to calendar events
    const assignmentEvents: CalendarEvent[] = mockAssignments.map((assignment) => ({
      id: assignment.id,
      title: `${assignment.title} - Hạn nộp`,
      description: assignment.description,
      date: assignment.dueDate,
      time: assignment.dueTime,
      location: "Nộp trực tuyến",
      type: "deadline",
      courseId: assignment.courseId,
      courseName: assignment.courseName,
      isDeadline: true,
      studentsCount: assignment.studentsCount,
      submissionsCount: assignment.submissionsCount,
    }))

    // Add regular class events
    const classEvents: CalendarEvent[] = [
      {
        id: "class1",
        title: "Toán học 101 - Bài giảng",
        description: "Đại số tuyến tính",
        date: "2025-06-15",
        time: "09:00",
        location: "Phòng 101",
        type: "class",
        courseId: "1",
        courseName: "Toán học 101",
      },
      {
        id: "class2",
        title: "Vật lý 101 - Thí nghiệm",
        description: "Thí nghiệm con lắc",
        date: "2025-06-18",
        time: "14:00",
        location: "Phòng thí nghiệm Vật lý",
        type: "class",
        courseId: "2",
        courseName: "Vật lý 101",
      },
      {
        id: "meeting1",
        title: "Họp khoa",
        description: "Họp giảng viên hàng tuần",
        date: "2025-06-17",
        time: "16:00",
        location: "Phòng họp",
        type: "meeting",
      },
    ]

    setEvents([...assignmentEvents, ...classEvents])
  }, [teacherId])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return events.filter((event) => {
      const matchesDate = event.date === dateString
      const matchesCourse = selectedCourse === "all" || event.courseId === selectedCourse
      return matchesDate && matchesCourse
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const hasDeadline = dayEvents.some((event) => event.isDeadline)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""} ${hasDeadline ? "has-deadline" : ""}`}>
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dayEvents.map((event) => (
              <div key={event.id} className="event-item" title={event.title}>
                {event.isDeadline && <AlertCircle className="w-3 h-3 mr-1" />}
                {event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title}
                {event.isDeadline && (
                  <span className="submission-count">
                    ({event.submissionsCount}/{event.studentsCount})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>,
      )
    }

    return days
  }

  const monthNames = [
    "tháng 1",
    "tháng 2",
    "tháng 3",
    "tháng 4",
    "tháng 5",
    "tháng 6",
    "tháng 7",
    "tháng 8",
    "tháng 9",
    "tháng 10",
    "tháng 11",
    "tháng 12",
  ]

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
  const upcomingDeadlines = events.filter((event) => event.isDeadline && new Date(event.date) >= new Date())

  return (
    <div className="teacher-calendar-container">
      <div className="calendar-header">
        <div className="calendar-controls">
          <Select
            value={selectedCourse}
            onChange={setSelectedCourse}
            placeholder="Tất cả các lớp học"
            className="course-filter"
          >
            <SelectItem value="all">Tất cả các lớp học</SelectItem>
            <SelectItem value="1">Toán học 101</SelectItem>
            <SelectItem value="2">Vật lý 101</SelectItem>
            <SelectItem value="3">Hóa học 101</SelectItem>
          </Select>
        </div>

        <div className="calendar-navigation">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button className="new-event-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tạo sự kiện
        </Button>
      </div>

      {/* Assignment Deadlines Overview */}
      {upcomingDeadlines.length > 0 && (
        <Card className="deadlines-overview mb-6">
          <div className="deadlines-header">
            <AlertCircle className="w-5 h-5 text-orange-600" />
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
                  <div className="deadline-date">{new Date(deadline.date).toLocaleDateString("vi-VN")}</div>
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
      )}

      <Card className="calendar-card">
        <div className="calendar-grid">
          <div className="weekdays">
            {weekDays.map((day) => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>
          <div className="days-grid">{renderCalendarGrid()}</div>
        </div>
      </Card>
      <div className="calendar-footer">
        <p>
          Hiện tại bạn có {events.length} sự kiện trong tháng này. Hãy kiểm tra các sự kiện để không bỏ lỡ thông tin
          quan trọng!
        </p>
      </div>
    </div>
  )
}

export default TeacherCalendar
