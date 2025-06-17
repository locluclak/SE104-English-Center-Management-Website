import type React from "react"
import { Outlet } from "react-router-dom"
import "./StudentLayout.scss"

const StudentLayout: React.FC = () => {
  return (
    <div className="student-layout">
      <div className="student-main-content">
        <Outlet />
      </div>
    </div>
  )
}

export default StudentLayout
