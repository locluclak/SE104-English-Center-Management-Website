"use client"

import React, { useState, useEffect } from "react"
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "../../components/Ui/Tabs/tabs"
import { Calendar, FileText } from "../../components/Ui/Icons/icons"
import StudentCalendar from "./StudentCalendar"
import StudentPadlet from "./StudentPadlet"
import { useSystemContext } from "@/hooks/useSystemContext"

const StudentBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("calendar")
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useSystemContext()

  useEffect(() => {
    if (!token) {
      navigate("/login")
    }
  }, [token, navigate])

  useEffect(() => {
    const lastSegment = location.pathname.split("/").pop()
    if (lastSegment === "calendar" || lastSegment === "padlet") {
      setActiveTab(lastSegment)
    } else {
      setActiveTab("calendar")
    }
  }, [location.pathname])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate(`/student/board/${value}`)
  }

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
      </Tabs>

      <Routes>
        <Route index element={<Navigate to="calendar" replace />} />
        <Route path="calendar" element={<StudentCalendar />} />
        <Route path="padlet" element={<StudentPadlet />} />
      </Routes>
    </div>
  )
}

export default StudentBoard
