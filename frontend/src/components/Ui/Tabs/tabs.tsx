"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import "./tabs.scss"

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  children,
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={`tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = "" }) => {
  return <div className={`tabs-list ${className}`}>{children}</div>
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = "" }) => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs")
  }

  const { value: currentValue, onValueChange } = context
  const isActive = currentValue === value

  return (
    <button
      className={`tabs-trigger ${isActive ? "active" : ""} ${className}`}
      onClick={() => onValueChange(value)}
      data-state={isActive ? "active" : "inactive"}
    >
      {children}
    </button>
  )
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = "" }) => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("TabsContent must be used within Tabs")
  }

  const { value: currentValue } = context

  if (currentValue !== value) {
    return null
  }

  return <div className={`tabs-content ${className}`}>{children}</div>
}
