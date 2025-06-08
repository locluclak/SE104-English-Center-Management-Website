"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Ui/Card/card"
import { Button } from "../../components/Ui/Button/button"
import { Badge } from "../../components/Ui/Badge/badge"
import { Input } from "../../components/Ui/Input/input"
import { Textarea } from "../../components/Ui/Textarea/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "../../components/Ui/Dialog/dialog"
import { FileText, Download, Search, Plus, Eye } from "../../components/Ui/Icons/icons"

interface PadletAttachment {
  id: string
  title: string
  description: string
  fileName: string
  fileSize: string
  uploadDate: string
  courseId: string
  courseName: string
  type: "document" | "image" | "video" | "audio" | "other"
  downloadUrl: string
}

interface TeacherPadletProps {
  teacherId: string
  userRole: string
}

const TeacherPadlet: React.FC<TeacherPadletProps> = ({ teacherId, userRole }) => {
  const [attachments, setAttachments] = useState<PadletAttachment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newAttachment, setNewAttachment] = useState({
    title: "",
    description: "",
    courseId: "",
    courseName: "",
    file: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Mock data - replace with actual API calls
    setAttachments([
      {
        id: "1",
        title: "Mathematics Lecture Notes",
        description: "Chapter 5: Linear Algebra",
        fileName: "math_chapter5.pdf",
        fileSize: "2.5 MB",
        uploadDate: "2024-01-10",
        courseId: "1",
        courseName: "Mathematics 101",
        type: "document",
        downloadUrl: "/files/math_chapter5.pdf",
      },
      {
        id: "2",
        title: "Physics Lab Video",
        description: "Pendulum Motion Experiment",
        fileName: "pendulum_experiment.mp4",
        fileSize: "15.2 MB",
        uploadDate: "2024-01-12",
        courseId: "2",
        courseName: "Physics 101",
        type: "video",
        downloadUrl: "/files/pendulum_experiment.mp4",
      },
      {
        id: "3",
        title: "Chemistry Formula Sheet",
        description: "Common chemical formulas and equations",
        fileName: "chemistry_formulas.png",
        fileSize: "1.8 MB",
        uploadDate: "2024-01-14",
        courseId: "3",
        courseName: "Chemistry 101",
        type: "image",
        downloadUrl: "/files/chemistry_formulas.png",
      },
    ])
  }, [teacherId])

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "file-document"
      case "image":
        return "file-image"
      case "video":
        return "file-video"
      case "audio":
        return "file-audio"
      default:
        return "file-default"
    }
  }

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="icon" />
      case "image":
        return <Eye className="icon" />
      case "video":
        return <Eye className="icon" />
      case "audio":
        return <Eye className="icon" />
      default:
        return <FileText className="icon" />
    }
  }

  const filteredAttachments = attachments.filter((attachment) => {
    const matchesSearch =
      attachment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attachment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === "all" || attachment.courseId === selectedCourse
    return matchesSearch && matchesCourse
  })

  const handleDownload = (attachment: PadletAttachment) => {
    console.log(`Downloading: ${attachment.fileName}`)
    // Implement download logic
    window.open(attachment.downloadUrl, "_blank")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAttachment({ ...newAttachment, file: e.target.files[0] })
    }
  }

  const handleUpload = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      if (!newAttachment.file) return

      const fileExtension = newAttachment.file.name.split(".").pop() || ""
      let fileType: "document" | "image" | "video" | "audio" | "other" = "other"

      if (["pdf", "doc", "docx", "txt"].includes(fileExtension)) fileType = "document"
      else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) fileType = "image"
      else if (["mp4", "mov", "avi"].includes(fileExtension)) fileType = "video"
      else if (["mp3", "wav"].includes(fileExtension)) fileType = "audio"

      const newId = `${attachments.length + 1}`
      const fileSize = `${(newAttachment.file.size / (1024 * 1024)).toFixed(1)} MB`

      const newFile: PadletAttachment = {
        id: newId,
        title: newAttachment.title,
        description: newAttachment.description,
        fileName: newAttachment.file.name,
        fileSize: fileSize,
        uploadDate: new Date().toISOString().split("T")[0],
        courseId: newAttachment.courseId || "1",
        courseName: newAttachment.courseName || "Mathematics 101",
        type: fileType,
        downloadUrl: `/files/${newAttachment.file.name}`,
      }

      setAttachments([...attachments, newFile])
      setNewAttachment({
        title: "",
        description: "",
        courseId: "",
        courseName: "",
        file: null,
      })
      setIsSubmitting(false)
      setIsUploadDialogOpen(false)
    }, 1000)
  }

  const courses = Array.from(new Set(attachments.map((a) => ({ id: a.courseId, name: a.courseName }))))

  return (
    <div className="teacher-padlet">
      <div className="padlet-header">
        <h2>Padlet Attachments</h2>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="icon" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Attachment</DialogTitle>
              <DialogDescription>Upload a new file to share with your courses.</DialogDescription>
            </DialogHeader>
            <div className="dialog-form">
              <div className="form-field">
                <label>Title</label>
                <Input
                  placeholder="Enter file title"
                  value={newAttachment.title}
                  onChange={(e) => setNewAttachment({ ...newAttachment, title: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Description</label>
                <Textarea
                  placeholder="Enter file description"
                  value={newAttachment.description}
                  onChange={(e) => setNewAttachment({ ...newAttachment, description: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Course</label>
                <Input
                  placeholder="Enter course name"
                  value={newAttachment.courseName}
                  onChange={(e) => setNewAttachment({ ...newAttachment, courseName: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>File</label>
                <Input type="file" onChange={handleFileChange} />
                {newAttachment.file && (
                  <div className="selected-file">
                    <span>Selected: {newAttachment.file.name}</span>
                    <span className="file-size">({(newAttachment.file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isSubmitting || !newAttachment.title || !newAttachment.file}
                loading={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="search-filter">
        <div className="search-input">
          <Search className="search-icon" />
          <Input
            placeholder="Search attachments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="filter-select">
          <option value="all">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Attachments Grid */}
      <div className="attachments-grid">
        {filteredAttachments.map((attachment) => (
          <Card key={attachment.id} className="attachment-card">
            <CardHeader>
              <div className="attachment-header">
                <div className="attachment-title-section">
                  {getFileTypeIcon(attachment.type)}
                  <CardTitle>{attachment.title}</CardTitle>
                </div>
                <Badge className={getFileTypeColor(attachment.type)}>{attachment.type}</Badge>
              </div>
              <CardDescription>{attachment.courseName}</CardDescription>
            </CardHeader>

            <CardContent className="attachment-content">
              <p className="attachment-description">{attachment.description}</p>

              <div className="file-details">
                <div className="detail-row">
                  <span>File:</span>
                  <span className="file-name">{attachment.fileName}</span>
                </div>
                <div className="detail-row">
                  <span>Size:</span>
                  <span>{attachment.fileSize}</span>
                </div>
                <div className="detail-row">
                  <span>Uploaded:</span>
                  <span>{new Date(attachment.uploadDate).toLocaleDateString()}</span>
                </div>
              </div>

              <Button className="download-btn" variant="outline" onClick={() => handleDownload(attachment)}>
                <Download className="icon" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAttachments.length === 0 && (
        <div className="empty-state">
          <FileText className="empty-icon" />
          <h3>No attachments found</h3>
          <p>
            {searchTerm || selectedCourse !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No files have been uploaded yet."}
          </p>
        </div>
      )}
    </div>
  )
}

export default TeacherPadlet
