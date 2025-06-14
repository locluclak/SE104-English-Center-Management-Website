import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/Ui/Dialog/dialog"
import { FileText, Download, Eye, Trash, Upload } from "../../components/Ui/Icons/icons"
import { MainApiRequest } from "../../services/MainApiRequest"
import "./TeacherDocumentItem.scss"

interface Document {
  id: string
  title: string
  description: string
  uploadDate: string
  fileType: "pdf" | "doc" | "ppt" | "image" | "video" | "other"
  fileSize: string
  downloadUrl: string
  file?: File | null
}

interface TeacherDocumentItemProps {
  document: Document
  onEdit?: (document: Document) => Promise<void> | void
  onRemoveFromUI?: (documentId: string) => void
}

export const TeacherDocumentItem: React.FC<TeacherDocumentItemProps> = ({ document, onEdit, onRemoveFromUI }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDocument, setEditedDocument] = useState<Document>({ ...document })
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const handleDownload = () => window.open(document.downloadUrl, "_blank")
  const handlePreview = () => window.open(document.downloadUrl, "_blank")

  const handleEditClick = () => {
    setIsEditDialogOpen(true)
    setEditedDocument({ ...document })
    setFilePreview(null)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await MainApiRequest.delete(`/document/delete/${document.id}`)
      onRemoveFromUI?.(document.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Lỗi xoá document:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveEdit = () => {
    setIsEditing(true)
    onEdit?.(editedDocument)
    setTimeout(() => {
      setIsEditing(false)
      setIsEditDialogOpen(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedDocument((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setEditedDocument((prev) => ({
        ...prev,
        file,
        fileType: getFileTypeFromName(file.name),
        fileSize: formatFileSize(file.size)
      }))

      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFilePreview(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const getFileTypeFromName = (filename: string): Document["fileType"] => {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (ext === "pdf") return "pdf"
    if (["doc", "docx"].includes(ext || "")) return "doc"
    if (["ppt", "pptx"].includes(ext || "")) return "ppt"
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) return "image"
    if (["mp4", "mov", "avi"].includes(ext || "")) return "video"
    return "other"
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const getFileTypeIcon = (type: string) => {
    if (["pdf", "doc", "ppt"].includes(type)) return <FileText className="icon" />
    if (["image", "video"].includes(type)) return <Eye className="icon" />
    return <FileText className="icon" />
  }

  const getFileTypeColor = (type: string) => {
    return `file-${type}` || "file-other"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`
  }

  return (
    <Card className="document-item">
      <CardHeader>
        <div className="document-header">
          <div className="document-title-section">
            {getFileTypeIcon(document.fileType)}
            <CardTitle>{document.title}</CardTitle>
          </div>
          <Badge className={getFileTypeColor(document.fileType)}>
            {document.fileType.toUpperCase()}
          </Badge>
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
          <div className="action-group">
            <Button variant="outline" className="edit-btn" onClick={handleEditClick}>
              <FileText className="icon" />
              Edit
            </Button>
            <Button variant="outline" className="delete-btn" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className="icon" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <div className="delete-confirmation">
            <p>
              Are you sure you want to delete <strong>{document.title}</strong>? This action cannot be undone.
            </p>
          </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="edit-dialog-content">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={editedDocument.title}
                onChange={handleInputChange}
                placeholder="Enter document title"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={editedDocument.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter document description"
              />
            </div>
            <div className="form-group">
              <label>Document File</label>
              <div className="file-upload-container">
                <label className="file-upload-label">
                  <input type="file" onChange={handleFileChange} className="file-upload-input" />
                  <div className="file-upload-button">
                    <Upload className="icon" />
                    <span>{editedDocument.file ? "Change File" : "Upload File"}</span>
                  </div>
                </label>
                {editedDocument.file && (
                  <div className="file-info">
                    <span>{editedDocument.file.name}</span>
                    <span>{formatFileSize(editedDocument.file.size)}</span>
                  </div>
                )}
                {!editedDocument.file && document.downloadUrl && (
                  <div className="file-info">
                    <span>Current file: {document.downloadUrl.split("/").pop()}</span>
                    <span>{document.fileSize}</span>
                  </div>
                )}
                {filePreview && (
                  <div className="file-preview">
                    <img src={filePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isEditing || !editedDocument.title} loading={isEditing}>
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
