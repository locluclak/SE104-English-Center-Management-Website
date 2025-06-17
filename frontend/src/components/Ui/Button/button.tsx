import type React from "react"
import "./button.scss"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "default",
  size = "md",
  loading = false,
  disabled,
  ...props
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${loading ? "btn-loading" : ""} ${className}`

  return (
    <button className={buttonClass} disabled={disabled || loading} {...props}>
      {loading && <span className="btn-spinner"></span>}
      {children}
    </button>
  )
}
