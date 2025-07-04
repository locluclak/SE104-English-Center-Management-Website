"use client"

import { useState, useEffect } from "react"
import { Card } from "antd"
import { Button } from "@/components/Ui/Button/button"
import { Select, SelectItem } from "@/components/Ui/Select/Select"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { MainApiRequest } from "@/services/MainApiRequest"
import "./TeacherCalendar.scss"

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

interface TeacherCalendarProps {
  teacherId: string
}

const TeacherCalendar: React.FC<TeacherCalendarProps> = ({ teacherId }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await MainApiRequest.get(`/course/teacher-courses/${teacherId}`);
        const courseList: Course[] = res.data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
        }));
        setCourses(courseList);

        let assignments: CalendarEvent[] = [];

        if (selectedCourse === "all") {
          const assignmentPromises = courseList.map(async (course) => {
            const assignRes = await MainApiRequest.get(`/course/${course.id}/assignments_time`);
            const items = assignRes.data.assignments || [];
            return items.map((a: any) => ({
              id: a.AS_ID,
              title: a.NAME,
              description: a.DESCRIPTION || "",
              startDate: a.START_DATE,
              endDate: a.END_DATE,
              time: a.END_DATE ? new Date(a.END_DATE).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "23:59", // Lấy giờ từ END_DATE
              type: "assignment",
              courseId: course.id,
              courseName: course.name,
            }));
          });
          const allAssignments = (await Promise.all(assignmentPromises)).flat();
          assignments = allAssignments;
        } else {
          const assignRes = await MainApiRequest.get(`/course/${selectedCourse}/assignments_time`);
          const items = assignRes.data.assignments || [];
          const courseName = courseList.find(c => c.id === selectedCourse)?.name || "Khóa học";
          assignments = items.map((a: any) => ({
            id: a.AS_ID,
            title: a.NAME,
            description: a.DESCRIPTION || "",
            startDate: a.START_DATE,
            endDate: a.END_DATE,
            time: a.END_DATE ? new Date(a.END_DATE).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "23:59", // Lấy giờ từ END_DATE
            type: "assignment",
            courseId: selectedCourse,
            courseName,
          }));
        }

        setEvents(assignments);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId, selectedCourse]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const isDateInRange = (currentCalendarDay: Date, eventStartString: string, eventEndString: string) => {
    const eventStartDate = new Date(eventStartString);
    const eventEndDate = new Date(eventEndString);

    const currentDayStart = new Date(currentCalendarDay.getFullYear(), currentCalendarDay.getMonth(), currentCalendarDay.getDate(), 0, 0, 0, 0);
    const currentDayEnd = new Date(currentCalendarDay.getFullYear(), currentCalendarDay.getMonth(), currentCalendarDay.getDate(), 23, 59, 59, 999);

    return eventStartDate <= currentDayEnd && eventEndDate >= currentDayStart;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isDateInRange(date, event.startDate, event.endDate))
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
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""} ${dayEvents.length > 0 ? "has-event" : ""}`}>
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dayEvents.slice(0, 2).map((event) => (
              <div key={event.id} className="event-item" title={`${event.title} (${event.courseName})`}>
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="event-more">+{dayEvents.length - 2} sự kiện</div>
            )}
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

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>
  if (error) return <div className="error">{error}</div>

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
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="calendar-navigation">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} disabled={loading}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} disabled={loading}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button className="new-event-btn" disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo sự kiện
        </Button>
      </div>

      <Card className="calendar-card" loading={loading}>
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
        <p>Hiện tại bạn có {events.length} sự kiện trong tháng này.</p>
      </div>
    </div>
  )
}

export default TeacherCalendar
