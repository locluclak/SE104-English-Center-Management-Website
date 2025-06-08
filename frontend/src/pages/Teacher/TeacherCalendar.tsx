"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Badge } from "../../components/Ui/Badge/badge"
import { Button } from "../../components/Ui/Button/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/Ui/Dialog/dialog"
import { Input } from "../../components/Ui/Input/input"
import { Textarea } from "../../components/Ui/Textarea/textarea"
import { Calendar, Clock, MapPin, Users, FileText, Plus } from "../../components/Ui/Icons/icons"

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

interface TeacherCalendarProps {
  teacherId: string
  userRole: string
}

const TeacherCalendar: React.FC<TeacherCalendarProps> = ({ teacherId, userRole }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "class",
    courseId: "",
    courseName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        title: "Department Meeting",
        description: "Weekly faculty meeting",
        date: "2024-01-17",
        time: "16:00",
        location: "Conference Room 205",
        type: "meeting",
      },
    ])
  }, [teacherId])

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

  const handleAddEvent = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newId = `${events.length + 1}`
      const eventToAdd: CalendarEvent = {
        id: newId,
        title: newEvent.title || "",
        description: newEvent.description || "",
        date: newEvent.date || "",
        time: newEvent.time || "",
        location: newEvent.location || "",
        type: (newEvent.type as "class" | "assignment" | "exam" | "meeting") || "class",
        courseId: newEvent.courseId,
        courseName: newEvent.courseName,
      }

      setEvents([...events, eventToAdd])
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        type: "class",
        courseId: "",
        courseName: "",
      })
      setIsSubmitting(false)
      setIsAddEventDialogOpen(false)
    }, 1000)
  }

  const sortedEvents = events.sort(
    (a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime(),
  )

  return (
    <div className="teacher-calendar">
      <div className="calendar-header">
        <h2>Academic Calendar</h2>
        <div className="calendar-actions">
          <Badge variant="outline">{events.length} Upcoming Events</Badge>
          <Button onClick={() => setIsAddEventDialogOpen(true)}>
            <Plus className="icon" />
            Add Event
          </Button>
        </div>
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

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>

          <div className="dialog-form">
            <div className="form-field">
              <label>Title</label>
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <Textarea
                placeholder="Event description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Date</label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Time</label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Location</label>
              <Input
                placeholder="Event location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Event Type</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                className="event-type-select"
              >
                <option value="class">Class</option>
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>

            <div className="form-field">
              <label>Course (Optional)</label>
              <Input
                placeholder="Course name"
                value={newEvent.courseName}
                onChange={(e) => setNewEvent({ ...newEvent, courseName: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddEvent}
              disabled={isSubmitting || !newEvent.title || !newEvent.date || !newEvent.time}
              loading={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeacherCalendar
