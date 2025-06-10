"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "antd"
import { Button } from "@/components/Ui/Button/button"
import { Select, SelectItem } from "@/components/Ui/Select/Select"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { MainApiRequest } from "@/services/MainApiRequest"

import "./StudentCalendar.scss"

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  type: "assignment" | "class" | "exam" | "deadline"
  courseId?: string
  courseName?: string
}

interface Course {
  id: string
  name: string
}

interface StudentCalendarProps {
  studentId: string
  userRole: string
}

const StudentCalendar: React.FC<StudentCalendarProps> = ({ studentId, userRole }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await MainApiRequest.get("/course/all")
        const data = res.data

        const formatted = data.map((c: any) => ({
          id: String(c.COURSE_ID),
          name: c.NAME,
        }))
        setCourses(formatted)
      } catch (err) {
        console.error("Failed to fetch courses", err)
      }
    }

    fetchCourses()

    // Mock events
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "NỘP BÀI TẬP BONUS tối h...",
        description: "Nộp bài tập bonus chương 3",
        date: "2025-06-30",
        time: "23:59",
        type: "assignment",
        courseId: "1",
        courseName: "Toán học 101",
      },
      {
        id: "2",
        title: "Kiểm tra giữa kỳ",
        description: "Kiểm tra giữa kỳ môn Vật lý",
        date: "2025-06-15",
        time: "14:00",
        type: "exam",
        courseId: "2",
        courseName: "Vật lý 101",
      },
      {
        id: "3",
        title: "Thực hành lab",
        description: "Thực hành thí nghiệm con lắc",
        date: "2025-06-08",
        time: "09:00",
        type: "class",
        courseId: "2",
        courseName: "Vật lý 101",
      },
    ]

    setEvents(mockEvents)
  }, [studentId])

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
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
      if (direction === "prev") newDate.setMonth(prev.getMonth() - 1)
      else newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""}`}>
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dayEvents.map((event) => (
              <div key={event.id} className="event-item" title={event.title}>
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return days
  }

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ]

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

  return (
    <div className="student-calendar-container">
      <div className="calendar-header">
        <div className="calendar-controls">
          <Select
            value={selectedCourse}
            onChange={setSelectedCourse}
            placeholder="Tất cả các khóa học"
            className="course-filter"
          >
            <SelectItem value="all">Tất cả các khóa học</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
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
          Sự kiện mới
        </Button>
      </div>

      <Card className="calendar-card">
        <div className="calendar-grid">
          <div className="weekdays">
            {weekDays.map((day) => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="days-grid">{renderCalendarGrid()}</div>
        </div>
      </Card>

      <div className="calendar-footer">
        <p>
          Hiện tại bạn có {events.length} sự kiện trong tháng này. Hãy kiểm tra các sự kiện để không bỏ lỡ thông tin quan trọng!
        </p>
      </div>
    </div>
  )
}

export default StudentCalendar
