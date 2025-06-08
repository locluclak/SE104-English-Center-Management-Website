import type React from "react"

interface IconProps {
  className?: string
  size?: number
}

export const Home: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-home ${className}`} style={{ fontSize: size }}></i>
)

export const BookOpen: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-book-open ${className}`} style={{ fontSize: size }}></i>
)

export const Calendar: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-calendar ${className}`} style={{ fontSize: size }}></i>
)

export const FileText: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-file-text ${className}`} style={{ fontSize: size }}></i>
)

export const Users: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-users ${className}`} style={{ fontSize: size }}></i>
)

export const Clock: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-clock ${className}`} style={{ fontSize: size }}></i>
)

export const MapPin: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-map-marker-alt ${className}`} style={{ fontSize: size }}></i>
)

export const Download: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-download ${className}`} style={{ fontSize: size }}></i>
)

export const Search: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-search ${className}`} style={{ fontSize: size }}></i>
)

export const Plus: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-plus ${className}`} style={{ fontSize: size }}></i>
)

export const Eye: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-eye ${className}`} style={{ fontSize: size }}></i>
)

export const ArrowRight: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-arrow-right ${className}`} style={{ fontSize: size }}></i>
)

export const ArrowLeft: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-arrow-left ${className}`} style={{ fontSize: size }}></i>
)

export const LogOut: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-sign-out-alt ${className}`} style={{ fontSize: size }}></i>
)

export const Upload: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-upload ${className}`} style={{ fontSize: size }}></i>
)

export const Trash: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <i className={`fas fa-trash ${className}`} style={{ fontSize: size }}></i>
)
