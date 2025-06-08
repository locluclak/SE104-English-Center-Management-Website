"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { FileText, Download, Eye } from "../../components/Ui/Icons/icons"
import "./StudentDocumentItem.scss"

interface Document {
  id: string
  title: string
  description: string
  uploadDate: string
  fileType: "pdf" | "doc" | "ppt" | "image" | "video" | "other"
  fileSize: string
  downloadUrl: string
}

interface StudentDocumentItemProps {
  document: Document
}

export const StudentDocumentItem: React.FC<StudentDocumentItemProps> = ({ document }) => {
  const handleDownload = () => {
    console.log(`Downloading document: ${document.title}`)
    // In a real app, this would trigger the download
    window.open(document.downloadUrl, "_blank")
  }

  const handlePreview = () => {
    console.log(`Previewing document: ${document.title}`)
    // In a real app, this would open a preview
    window.open(document.downloadUrl, "_blank")
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="icon" />
      case "doc":
        return <FileText className="icon" />
      case "ppt":
        return <FileText className="icon" />
      case "image":
        return <Eye className="icon" />
      case "video":
        return <Eye className="icon" />
      default:
        return <FileText className="icon" />
    }
  }

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return "file-pdf"
      case "doc":
        return "file-doc"
      case "ppt":
        return "file-ppt"
      case "image":
        return "file-image"
      case "video":
        return "file-video"
      default:
        return "file-other"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="document-item">
      <CardHeader>
        <div className="document-header">
          <div className="document-title-section">
            {getFileTypeIcon(document.fileType)}
            <CardTitle>{document.title}</CardTitle>
          </div>
          <Badge className={getFileTypeColor(document.fileType)}>{document.fileType.toUpperCase()}</Badge>
        </div>
        <CardDescription>Uploaded: {formatDate(document.uploadDate)}</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="document-description">{document.description}</p>

        <div className="document-meta">
          <span className="document-size">{document.fileSize}</span>
        </div>

        <div className="document-actions">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="icon" />
            Preview
          </Button>
          <Button onClick={handleDownload}>
            <Download className="icon" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
