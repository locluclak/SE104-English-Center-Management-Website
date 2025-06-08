import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/Ui/Dialog/dialog"
import { FileText, Download, Eye, Trash } from "../../components/Ui/Icons/icons"
import "./TeacherDocumentItem.scss"

interface Document {
  id: string
  title: string
  description: string
  uploadDate: string
  fileType: "pdf" | "doc" | "ppt" | "image" | "video" | "other"
  fileSize: string
  downloadUrl: string
}

interface TeacherDocumentItemProps {
  document: Document
}

export const TeacherDocumentItem: React.FC<TeacherDocumentItemProps> = ({ document }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = () => {
    setIsDeleting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(`Deleting document: ${document.title}`)
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      // In a real app, you would remove the document from the list
    }, 1000)
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
          <Button variant="outline" className="delete-btn" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="icon" />
            Delete
          </Button>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>

          <p className="delete-confirmation">
            Are you sure you want to delete <strong>{document.title}</strong>? This action cannot be undone.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting} loading={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
