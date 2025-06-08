"use client"

import React from "react"
import { Dropdown, Menu, Button } from "antd"
import type { MenuProps, DropdownProps } from "antd"
import "./dropdown-menu.scss"

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <>{children}</>
}

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, asChild }) => {
  if (asChild) {
    return <>{children}</>
  }
  return <Button className="dropdown-trigger">{children}</Button>
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, className }) => {
  // Convert children to menu items
  const menuItems: MenuProps["items"] =
    React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        const element = child as React.ReactElement<{ children: React.ReactNode; onClick?: () => void; disabled?: boolean }>;
        return {
          key: index,
          label: element.props.children,
          onClick: element.props.onClick,
          disabled: element.props.disabled,
        }
      }
      return null
    })?.filter(Boolean) || []

  return <Menu className={`custom-dropdown-menu ${className || ""}`} items={menuItems} />
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, onClick, disabled, className }) => {
  return (
    <div className={`dropdown-menu-item ${className || ""}`} onClick={onClick} style={{ opacity: disabled ? 0.5 : 1 }}>
      {children}
    </div>
  )
}

const DropdownMenuLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={`dropdown-menu-label ${className || ""}`}>{children}</div>
}

const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={`dropdown-menu-separator ${className || ""}`} />
}

// Wrapper component to combine trigger and content
interface CustomDropdownProps extends Omit<DropdownProps, "overlay"> {
  triggerNode: React.ReactNode
  content: React.ReactNode
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ triggerNode, content, ...props }) => {
  // Ensure content is a valid ReactElement, fallback to an empty fragment if not
  const overlayElement = React.isValidElement(content) ? content : <></>;
  return (
    <Dropdown overlay={overlayElement} trigger={["click"]} placement="bottomLeft" {...props}>
      {triggerNode}
    </Dropdown>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  CustomDropdown,
}
