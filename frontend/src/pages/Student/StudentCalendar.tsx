"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, Spin } from "antd"
import { Button } from "@/components/Ui/Button/button"
import { Select, SelectItem } from "@/components/Ui/Select/Select"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { MainApiRequest } from "@/services/MainApiRequest"
import "./StudentCalendar.scss"

import { jwtDecode } from "jwt-decode"

interface CalendarEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  time: string
  type: "assignment" | "class" | "exam" | "deadline"
  courseId?: string
  courseName?: string
}

interface Course {
  id: string
  name: string
}

const StudentCalendar: React.FC = () => {
  // --- Auth --------------------------------------------------------------
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    const tokenString = localStorage.getItem("token")
    if (!tokenString) return

    try {
      const decoded: any = jwtDecode(tokenString)
      const idInToken = decoded?.id ?? decoded?.sub
      if (idInToken) setStudentId(String(idInToken))
    } catch (err) {
      console.error("Không thể giải mã JWT:", err)
      localStorage.removeItem("token")
    }
  }, [])

  // --- State -------------------------------------------------------------
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- Helpers -----------------------------------------------------------
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Mon‑first calendar
  }

  const isDateInRange = (currentCalendarDay: Date, eventStartString: string, eventEndString: string) => {
    const eventStartDate = new Date(eventStartString)
    const eventEndDate = new Date(eventEndString)

    const currentDayStart = new Date(
      currentCalendarDay.getFullYear(),
      currentCalendarDay.getMonth(),
      currentCalendarDay.getDate(),
      0,
      0,
      0,
      0
    )
    const currentDayEnd = new Date(
      currentCalendarDay.getFullYear(),
      currentCalendarDay.getMonth(),
      currentCalendarDay.getDate(),
      23,
      59,
      59,
      999
    )

    return eventStartDate <= currentDayEnd && eventEndDate >= currentDayStart
  }

  const getEventsForDate = (date: Date) => events.filter((e) => isDateInRange(date, e.startDate, e.endDate))

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
      return next
    })
  }

  // --- Data --------------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError(null)

    try {
      // 1. Course list for filter
      const resCourses = await MainApiRequest.get(`/course/student/${studentId}`)
      const courseList: Course[] = (resCourses.data as any[]).map((c) => ({ id: String(c.COURSE_ID), name: c.NAME }))
      setCourses(courseList)

      // 2. Events
      let assignments: any[] = []
      if (selectedCourse === "all") {
        const allRes = await MainApiRequest.get(`/course/student/${studentId}/calendar`)
        assignments = allRes.data.assignments || []
      } else {
        const oneRes = await MainApiRequest.get(`/course/${selectedCourse}/assignments_time`)
        assignments = oneRes.data.assignments || []
      }

      const mapped: CalendarEvent[] = assignments.map((a: any) => {
        const end = a.assignmentEndDate || a.END_DATE
        return {
          id: String(a.AS_ID),
          title: a.assignmentName || a.NAME,
          description: a.assignmentDescription || a.DESCRIPTION || "",
          startDate: a.assignmentStartDate || a.START_DATE,
          endDate: end,
          time: end ? new Date(end).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "23:59",
          type: "assignment",
          courseId: String(a.COURSE_ID ?? selectedCourse),
          courseName: courseList.find((c) => c.id === String(a.COURSE_ID ?? selectedCourse))?.name || "Khóa học",
        }
      })

      setEvents(mapped)
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err)
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }, [studentId, selectedCourse])

  // Trigger when studentId or selectedCourse changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- Render helpers ----------------------------------------------------
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const cells: React.ReactNode[] = []

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Real days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      cells.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? "today" : ""} ${dayEvents.length > 0 ? "has-event" : ""}`}
        >
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dayEvents.slice(0, 2).map((event) => (
              <div key={event.id} className="event-item" title={`${event.title} (${event.courseName})`}>
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && <div className="event-more">+{dayEvents.length - 2} sự kiện</div>}
          </div>
        </div>
      )
    }

    return cells
  }

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]
  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

  // --- UI ----------------------------------------------------------------
  if (!studentId)
    return <div style={{ textAlign: "center", padding: 40 }}>Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập.</div>
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    )
  if (error)
    return (
      <div style={{ textAlign: "center", padding: 40, color: "red" }}>
        {error}
      </div>
    )

  return (
    <div className="student-calendar-container">
      {/* Header ---------------------------------------------------------*/}
      <div className="calendar-header">
        <div className="calendar-controls">
          <Select
            value={selectedCourse}
            onChange={setSelectedCourse}
            placeholder="Tất cả các khóa học"
            className="course-filter"
          >
            <SelectItem value="all">Tất cả các khóa học</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="calendar-navigation">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}
            disabled={loading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}
            disabled={loading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

      </div>

      {/* Calendar card ----------------------------------------------------*/}
      <Card className="calendar-card">
        <div className="calendar-grid">
          <div className="weekdays">
            {weekDays.map((d) => (
              <div key={d} className="weekday">
                {d}
              </div>
            ))}
          </div>
          <div className="days-grid">{renderCalendarGrid()}</div>
        </div>
      </Card>

      {/* Footer -----------------------------------------------------------*/}
      <div className="calendar-footer">
        <p>Hiện tại bạn có {events.length} sự kiện trong tháng này.</p>
      </div>
    </div>
  )
}

export default StudentCalendar
