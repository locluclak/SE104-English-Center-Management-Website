"use client"

import React from "react"
import { useState } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "../../components/Ui/Tabs/tabs"
import { Calendar, FileText } from "../../components/Ui/Icons/icons"
import StudentCalendar from "./StudentCalendar"
import StudentPadlet from "./StudentPadlet"

interface StudentBoardProps {
  studentId: string
  userRole: string
}

const StudentBoard: React.FC<StudentBoardProps> = ({ studentId, userRole }) => {
  const [activeTab, setActiveTab] = useState("calendar")
  const navigate = useNavigate()
  const location = useLocation()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate(`/student/board/${value}`)
  }

  // Determine active tab from URL
  React.useEffect(() => {
    const pathSegments = location.pathname.split("/")
    const lastSegment = pathSegments[pathSegments.length - 1]
    if (lastSegment === "calendar" || lastSegment === "padlet") {
      setActiveTab(lastSegment)
    } else {
      setActiveTab("calendar")
    }
  }, [location.pathname])

  return (
    <div className="student-board">
      <div className="page-header">
        <h1>Student Board</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="board-tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="calendar" className="tab-trigger">
            <Calendar className="icon" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="padlet" className="tab-trigger">
            <FileText className="icon" />
            Padlet Attachment
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<StudentCalendar studentId={studentId} userRole={userRole} />} />
          <Route path="calendar" element={<StudentCalendar studentId={studentId} userRole={userRole} />} />
          <Route path="padlet" element={<StudentPadlet studentId={studentId} userRole={userRole} />} />
        </Routes>
      </Tabs>
    </div>
  )
}

export default StudentBoard
