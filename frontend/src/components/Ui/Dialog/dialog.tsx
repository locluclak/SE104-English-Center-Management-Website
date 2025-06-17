"use client"

import type React from "react"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import "./dialog.scss"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
}

interface DialogTitleProps {
  children: React.ReactNode
}

interface DialogDescriptionProps {
  children: React.ReactNode
}

interface DialogFooterProps {
  children: React.ReactNode
}

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="dialog-overlay" onClick={() => onOpenChange(false)}>
      <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild }) => {
  if (asChild) {
    return <>{children}</>
  }
  return <>{children}</>
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = "" }) => {
  return <div className={`dialog-content ${className}`}>{children}</div>
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="dialog-header">{children}</div>
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <h2 className="dialog-title">{children}</h2>
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  return <p className="dialog-description">{children}</p>
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return <div className="dialog-footer">{children}</div>
}
