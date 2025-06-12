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

interface StudentCalendarProps {
  studentId: string
  userRole: string
}

const StudentCalendar: React.FC<StudentCalendarProps> = ({ studentId }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await MainApiRequest.get(`/course/student/${studentId}`)
        const data = res.data
        const formatted = data.map((c: any) => ({
          id: String(c.COURSE_ID),
          name: c.NAME,
        }))
        setCourses(formatted)
      } catch (err) {
        console.error("Không thể lấy danh sách lớp học", err)
      }
    }

    fetchCourses()
  }, [studentId])

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const endpoint =
          selectedCourse === "all"
            ? "/assignment/all"
            : `/assignment/getbycourse/${selectedCourse}`

        const res = await MainApiRequest.get(endpoint)
        const data = res.data.assignments

        const mapped = data.map((a: any) => ({
          id: a.AS_ID,
          title: a.NAME,
          description: "",
          startDate: a.START_DATE,
          endDate: a.END_DATE,
          time: "23:59",
          type: "assignment",
          courseId: a.COURSE_ID?.toString() || selectedCourse,
          courseName: mapCourseName(a.COURSE_ID?.toString() || selectedCourse),
        }))

        setEvents(mapped)
      } catch (err) {
        console.error("Không thể lấy assignment", err)
        setEvents([])
      }
    }

    fetchAssignments()
  }, [selectedCourse])

  const mapCourseName = (id: string) => {
  const course = courses.find(c => c.id === id)
  return course?.name || "Khoá học"
}


  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const isDateInRange = (date: string, start: string, end: string) => {
    const d = new Date(date)
    return d >= new Date(start) && d <= new Date(end)
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return events.filter((event) => isDateInRange(dateString, event.startDate, event.endDate))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
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
      const dateString = date.toISOString().split("T")[0]
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""} ${dayEvents.length > 0 ? "has-event" : ""}`}>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
          >
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
          Hiện tại bạn có {events.length} sự kiện trong tháng này. Hãy kiểm tra
          các sự kiện để không bỏ lỡ thông tin quan trọng!
        </p>
      </div>
    </div>
  );
}

export default StudentCalendar
