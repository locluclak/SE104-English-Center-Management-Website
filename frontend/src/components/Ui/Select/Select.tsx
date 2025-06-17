"use client"

import type React from "react"
import { Select as AntSelect } from "antd"
import type { SelectProps } from "antd"
import "./Select.scss"

const { Option } = AntSelect

interface CustomSelectProps extends SelectProps {
  children?: React.ReactNode
}

const Select: React.FC<CustomSelectProps> = ({ className, children, ...props }) => {
  return (
    <AntSelect className={`custom-select ${className || ""}`} {...props}>
      {children}
    </AntSelect>
  )
}

const SelectTrigger: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  // This is just a wrapper for consistency with the previous API
  return <div className={className}>{children}</div>
}

const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ant Design handles the content internally
  return <>{children}</>
}

const SelectItem: React.FC<{
  value: string | number
  children: React.ReactNode
  disabled?: boolean
}> = ({ value, children, disabled }) => {
  return (
    <Option value={value} disabled={disabled}>
      {children}
    </Option>
  )
}

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  // Ant Design handles this internally through the Select component
  return null
}

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Option }
