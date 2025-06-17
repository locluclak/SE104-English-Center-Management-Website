import type React from "react"
import { Outlet } from "react-router-dom"
import "./TeacherLayout.scss"

const TeacherLayout: React.FC = () => {
  return (
    <div className="teacher-layout">
      <div className="teacher-main-content">
        <Outlet />
      </div>
    </div>
  )
}

export default TeacherLayout
