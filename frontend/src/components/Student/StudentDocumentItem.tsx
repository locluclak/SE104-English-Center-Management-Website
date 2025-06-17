"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { FileText, Download, Eye } from "../../components/Ui/Icons/icons"
import "./StudentDocumentItem.scss"

interface Document {
  id: number
  title: string
  description: string
  file?: string // e.g. /uploads/abc.pdf
}

interface StudentDocumentItemProps {
  document: Document
}

export const StudentDocumentItem: React.FC<StudentDocumentItemProps> = ({ document }) => {
  const handleDownload = () => {
    if (document.file) {
      window.open(document.file, "_blank")
    }
  }

  const handlePreview = () => {
    if (document.file) {
      window.open(document.file, "_blank")
    }
  }

  const getFileExtension = (filePath: string) => {
    const ext = filePath?.split(".").pop()?.toLowerCase()
    return ext || "other"
  }

  const getFileTypeIcon = (ext: string) => {
    switch (ext) {
      case "pdf":
      case "doc":
      case "docx":
      case "ppt":
      case "pptx":
        return <FileText className="icon" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Eye className="icon" />
      case "mp4":
      case "mov":
      case "avi":
      case "webm":
        return <Eye className="icon" />
      default:
        return <FileText className="icon" />
    }
  }

  const getFileTypeColor = (ext: string) => {
    switch (ext) {
      case "pdf":
        return "file-pdf"
      case "doc":
      case "docx":
        return "file-doc"
      case "ppt":
      case "pptx":
        return "file-ppt"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "file-image"
      case "mp4":
      case "mov":
        return "file-video"
      default:
        return "file-other"
    }
  }

  const fileExt = getFileExtension(document.file || "")

  return (
    <Card className="document-item">
      <CardHeader>
        <div className="document-header">
          <div className="document-title-section">
            {getFileTypeIcon(fileExt)}
            <CardTitle>{document.title}</CardTitle>
          </div>
          <Badge className={getFileTypeColor(fileExt)}>{fileExt.toUpperCase()}</Badge>
        </div>
        <CardDescription>{document.file ? "Tài liệu đính kèm" : "Không có tệp"}</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="document-description">{document.description}</p>

        <div className="document-actions">
          {document.file ? (
            <>
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="icon" />
                Xem trước
              </Button>
              <Button onClick={handleDownload}>
                <Download className="icon" />
                Tải về
              </Button>
            </>
          ) : (
            <span className="no-file-warning">Không có file đính kèm</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
