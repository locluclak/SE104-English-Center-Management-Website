import type React from "react"
import "./badge.scss"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "default",
  size = "md",
  ...props
}) => {
  const badgeClass = `badge badge-${variant} badge-${size} ${className}`

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  )
}
