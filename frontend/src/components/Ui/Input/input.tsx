import type React from "react"
import "./input.scss"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = "", ...props }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {icon && <div className="input-icon">{icon}</div>}
        <input className={`input ${icon ? "input-with-icon" : ""} ${error ? "input-error" : ""}`} {...props} />
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  )
}
