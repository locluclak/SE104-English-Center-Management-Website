"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Ui/Card/card"
import { Badge } from "@/components/Ui/Badge/badge"
import { Calendar, Clock, MapPin, Users, FileText } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: "class" | "assignment" | "exam" | "meeting"
  courseId?: string
  courseName?: string
}

interface StudentCalendarProps {
  studentId: string
  userRole: string
}

const StudentCalendar: React.FC<StudentCalendarProps> = ({ studentId, userRole }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    // Mock data - replace with actual API calls
    setEvents([
      {
        id: "1",
        title: "Mathematics 101 - Lecture",
        description: "Algebra and Linear Equations",
        date: "2024-01-15",
        time: "09:00",
        location: "Room 101",
        type: "class",
        courseId: "1",
        courseName: "Mathematics 101",
      },
      {
        id: "2",
        title: "Physics Assignment Due",
        description: "Lab Report on Motion",
        date: "2024-01-16",
        time: "23:59",
        location: "Online Submission",
        type: "assignment",
        courseId: "2",
        courseName: "Physics 101",
      },
      {
        id: "3",
        title: "Chemistry Exam",
        description: "Midterm Examination",
        date: "2024-01-18",
        time: "14:00",
        location: "Exam Hall A",
        type: "exam",
        courseId: "3",
        courseName: "Chemistry 101",
      },
      {
        id: "4",
        title: "Study Group Meeting",
        description: "Mathematics study session",
        date: "2024-01-17",
        time: "16:00",
        location: "Library Room 205",
        type: "meeting",
      },
    ])
  }, [studentId])

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "event-class"
      case "assignment":
        return "event-assignment"
      case "exam":
        return "event-exam"
      case "meeting":
        return "event-meeting"
      default:
        return "event-default"
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "class":
        return <Users className="icon" />
      case "assignment":
        return <FileText className="icon" />
      case "exam":
        return <Clock className="icon" />
      case "meeting":
        return <Users className="icon" />
      default:
        return <Calendar className="icon" />
    }
  }

  const sortedEvents = events.sort(
    (a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime(),
  )

  return (
    <div className="student-calendar">
      <div className="calendar-header">
        <h2>Academic Calendar</h2>
        <Badge variant="outline">{events.length} Upcoming Events</Badge>
      </div>

      <div className="events-grid">
        {sortedEvents.map((event) => (
          <Card key={event.id} className="event-card">
            <CardHeader>
              <div className="event-header">
                <div className="event-title-section">
                  {getEventIcon(event.type)}
                  <CardTitle>{event.title}</CardTitle>
                </div>
                <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
              </div>
              {event.courseName && <CardDescription>{event.courseName}</CardDescription>}
            </CardHeader>

            <CardContent className="event-content">
              <p className="event-description">{event.description}</p>

              <div className="event-details">
                <div className="detail-item">
                  <Calendar className="icon" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <Clock className="icon" />
                  <span>{event.time}</span>
                </div>
                <div className="detail-item">
                  <MapPin className="icon" />
                  <span>{event.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="empty-state">
          <Calendar className="empty-icon" />
          <h3>No events scheduled</h3>
          <p>Your calendar is empty. Events will appear here when scheduled.</p>
        </div>
      )}
    </div>
  )
}

export default StudentCalendar
