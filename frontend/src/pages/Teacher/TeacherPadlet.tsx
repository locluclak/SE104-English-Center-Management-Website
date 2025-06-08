"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, Modal, Input, Button as AntButton, Dropdown, Menu } from "antd"
import { Button } from "@/components/Ui/Button/button"
import { Badge } from "@/components/Ui/Badge/badge"
import { Textarea } from "@/components/Ui/Textarea/textarea"
import {
  Download,
  Search,
  Plus,
  Mic,
  MicOff,
  Paperclip,
  Trash,
  StickyNote,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  BookOpen,
  Users,
  FileText,
} from "lucide-react"

import "./TeacherPadlet.scss"

interface PadletNote {
  id: string
  title: string
  content: string
  formattedContent: string
  createdDate: string
  updatedDate: string
  attachments: {
    id: string
    fileName: string
    fileSize: string
    fileType: string
    downloadUrl: string
  }[]
  audioRecording?: {
    id: string
    fileName: string
    duration: string
    downloadUrl: string
  }
  tags: string[]
  color: string
  category: "teaching" | "research" | "admin" | "personal"
  textFormat: {
    fontSize: string
    fontWeight: string
    fontStyle: string
    textAlign: string
    textColor: string
  }
}

interface TeacherPadletProps {
  teacherId: string
  userRole: string
}

const TeacherPadlet: React.FC<TeacherPadletProps> = ({ teacherId, userRole }) => {
  const [notes, setNotes] = useState<PadletNote[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreateNoteDialogOpen, setIsCreateNoteDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    attachments: [] as File[],
    tags: [] as string[],
    color: "#ffffff",
    category: "teaching" as "teaching" | "research" | "admin" | "personal",
    textFormat: {
      fontSize: "14px",
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      textColor: "#000000",
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Mock data - teaching and research notes
    setNotes([
      {
        id: "1",
        title: "Ý tưởng giảng dạy Đại số tuyến tính",
        content:
          "Phương pháp mới để giải thích giá trị riêng bằng phép biến đổi hình học. Sinh viên gặp khó khăn với các khái niệm trừu tượng.",
        formattedContent:
          "Phương pháp mới để giải thích <strong>giá trị riêng</strong> bằng phép biến đổi hình học. Sinh viên gặp khó khăn với các khái niệm trừu tượng.",
        createdDate: "2024-01-10",
        updatedDate: "2024-01-12",
        attachments: [],
        tags: ["giảng dạy", "toán học", "đại số tuyến tính"],
        color: "#fef3c7",
        category: "teaching",
        textFormat: {
          fontSize: "14px",
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "left",
          textColor: "#000000",
        },
      },
      {
        id: "2",
        title: "Ghi chú Hội nghị - EdTech 2024",
        content:
          "Bài thuyết trình thú vị về AI trong giáo dục. Điểm chính: lộ trình học tập cá nhân hóa tăng mức độ tham gia 40%.",
        formattedContent:
          "Bài thuyết trình thú vị về <strong>AI trong giáo dục</strong>. Điểm chính: lộ trình học tập cá nhân hóa tăng mức độ tham gia <em>40%</em>.",
        createdDate: "2024-01-08",
        updatedDate: "2024-01-08",
        attachments: [
          {
            id: "att1",
            fileName: "edtech_presentation.pdf",
            fileSize: "2.1 MB",
            fileType: "pdf",
            downloadUrl: "/files/edtech_presentation.pdf",
          },
        ],
        tags: ["hội nghị", "ai", "giáo dục"],
        color: "#dbeafe",
        category: "research",
        textFormat: {
          fontSize: "14px",
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "left",
          textColor: "#000000",
        },
      },
      {
        id: "3",
        title: "Ghi âm bài giảng - Vật lý lượng tử",
        content: "Ghi âm bài giảng hôm nay về sự rối lượng tử. Giải thích hay về định lý Bell.",
        formattedContent:
          "Ghi âm bài giảng hôm nay về <strong>sự rối lượng tử</strong>. Giải thích hay về định lý Bell.",
        createdDate: "2024-01-05",
        updatedDate: "2024-01-05",
        attachments: [],
        audioRecording: {
          id: "audio1",
          fileName: "quantum_lecture.mp3",
          duration: "52:15",
          downloadUrl: "/audio/quantum_lecture.mp3",
        },
        tags: ["vật lý", "bài giảng", "lượng tử"],
        color: "#f3e8ff",
        category: "teaching",
        textFormat: {
          fontSize: "14px",
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "left",
          textColor: "#000000",
        },
      },
      {
        id: "4",
        title: "Kế hoạch nghiên cứu 2024",
        content: "Đề xuất nghiên cứu về ứng dụng machine learning trong phân tích dữ liệu giáo dục.",
        formattedContent:
          "Đề xuất nghiên cứu về ứng dụng <strong>machine learning</strong> trong phân tích dữ liệu giáo dục.",
        createdDate: "2024-01-03",
        updatedDate: "2024-01-03",
        attachments: [],
        tags: ["nghiên cứu", "machine learning", "giáo dục"],
        color: "#dcfce7",
        category: "research",
        textFormat: {
          fontSize: "14px",
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "left",
          textColor: "#000000",
        },
      },
    ])
  }, [teacherId])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const applyTextFormat = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = newNote.content.substring(start, end)

    if (selectedText) {
      let formattedText = selectedText
      switch (format) {
        case "bold":
          formattedText = `**${selectedText}**`
          break
        case "italic":
          formattedText = `*${selectedText}*`
          break
        case "underline":
          formattedText = `__${selectedText}__`
          break
      }

      const newContent = newNote.content.substring(0, start) + formattedText + newNote.content.substring(end)
      setNewNote({ ...newNote, content: newContent })
    }
  }

  const updateTextFormat = (property: string, value: string) => {
    setNewNote({
      ...newNote,
      textFormat: {
        ...newNote.textFormat,
        [property]: value,
      },
    })
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTag = selectedTag === "all" || note.tags.includes(selectedTag)
    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory
    return matchesSearch && matchesTag && matchesCategory
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setNewNote({ ...newNote, attachments: [...newNote.attachments, ...filesArray] })
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = newNote.attachments.filter((_, i) => i !== index)
    setNewNote({ ...newNote, attachments: updatedFiles })
  }

  const addTag = (tag: string) => {
    if (tag && !newNote.tags.includes(tag)) {
      setNewNote({ ...newNote, tags: [...newNote.tags, tag] })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewNote({ ...newNote, tags: newNote.tags.filter((tag) => tag !== tagToRemove) })
  }

  const handleCreateNote = () => {
    setIsSubmitting(true)

    setTimeout(() => {
      const attachments = newNote.attachments.map((file, index) => ({
        id: `att_${Date.now()}_${index}`,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        fileType: file.name.split(".").pop() || "unknown",
        downloadUrl: `/files/${file.name}`,
      }))

      let audioRecording = undefined
      if (audioBlob) {
        audioRecording = {
          id: `audio_${Date.now()}`,
          fileName: `recording_${Date.now()}.wav`,
          duration: formatTime(recordingTime),
          downloadUrl: URL.createObjectURL(audioBlob),
        }
      }

      const newId = `${notes.length + 1}`
      const noteToAdd: PadletNote = {
        id: newId,
        title: newNote.title,
        content: newNote.content,
        formattedContent: newNote.content,
        createdDate: new Date().toISOString().split("T")[0],
        updatedDate: new Date().toISOString().split("T")[0],
        attachments: attachments,
        audioRecording: audioRecording,
        tags: newNote.tags,
        color: newNote.color,
        category: newNote.category,
        textFormat: newNote.textFormat,
      }

      setNotes([noteToAdd, ...notes])
      setNewNote({
        title: "",
        content: "",
        attachments: [],
        tags: [],
        color: "#ffffff",
        category: "teaching",
        textFormat: {
          fontSize: "14px",
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "left",
          textColor: "#000000",
        },
      })
      setAudioBlob(null)
      setRecordingTime(0)
      setIsSubmitting(false)
      setIsCreateNoteDialogOpen(false)
    }, 1000)
  }

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId))
  }

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)))

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "teaching":
        return <BookOpen className="w-4 h-4" />
      case "research":
        return <FileText className="w-4 h-4" />
      case "admin":
        return <Users className="w-4 h-4" />
      default:
        return <StickyNote className="w-4 h-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "teaching":
        return "Giảng dạy"
      case "research":
        return "Nghiên cứu"
      case "admin":
        return "Hành chính"
      case "personal":
        return "Cá nhân"
      default:
        return "Khác"
    }
  }

  // Font size menu
  const fontSizeMenu = (
    <Menu
      onClick={({ key }) => updateTextFormat("fontSize", key)}
      items={[
        { key: "12px", label: "12px" },
        { key: "14px", label: "14px" },
        { key: "16px", label: "16px" },
        { key: "18px", label: "18px" },
        { key: "20px", label: "20px" },
      ]}
    />
  )

  // Text color menu
  const textColorMenu = (
    <Menu
      onClick={({ key }) => updateTextFormat("textColor", key)}
      items={[
        { key: "#000000", label: "Đen" },
        { key: "#dc2626", label: "Đỏ" },
        { key: "#2563eb", label: "Xanh dương" },
        { key: "#16a34a", label: "Xanh lá" },
        { key: "#ca8a04", label: "Vàng" },
      ]}
    />
  )

  return (
    <div className="teacher-padlet">
      <div className="padlet-header">
        <h2 className="text-2xl font-bold text-gray-900">Ghi chú Giảng dạy & Nghiên cứu</h2>
        <Button className="create-note-btn" onClick={() => setIsCreateNoteDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo ghi chú mới
        </Button>
      </div>

      {/* Create Note Modal */}
      <Modal
        title="Tạo ghi chú mới"
        open={isCreateNoteDialogOpen}
        onCancel={() => setIsCreateNoteDialogOpen(false)}
        footer={[
          <AntButton key="cancel" onClick={() => setIsCreateNoteDialogOpen(false)}>
            Hủy
          </AntButton>,
          <AntButton
            key="submit"
            type="primary"
            loading={isSubmitting}
            disabled={!newNote.title}
            onClick={handleCreateNote}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo ghi chú"}
          </AntButton>,
        ]}
        width={800}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề</label>
            <Input
              placeholder="Nhập tiêu đề ghi chú"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Danh mục</label>
            <select
              value={newNote.category}
              onChange={(e) =>
                setNewNote({ ...newNote, category: e.target.value as "teaching" | "research" | "admin" | "personal" })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="teaching">Giảng dạy</option>
              <option value="research">Nghiên cứu</option>
              <option value="admin">Hành chính</option>
              <option value="personal">Cá nhân</option>
            </select>
          </div>

          {/* Text Formatting Toolbar */}
          <div className="text-formatting-toolbar">
            <div className="toolbar-section">
              <AntButton size="small" onClick={() => applyTextFormat("bold")}>
                <Bold className="w-4 h-4" />
              </AntButton>
              <AntButton size="small" onClick={() => applyTextFormat("italic")}>
                <Italic className="w-4 h-4" />
              </AntButton>
              <AntButton size="small" onClick={() => applyTextFormat("underline")}>
                <Underline className="w-4 h-4" />
              </AntButton>
            </div>

            <div className="toolbar-section">
              <AntButton size="small" onClick={() => updateTextFormat("textAlign", "left")}>
                <AlignLeft className="w-4 h-4" />
              </AntButton>
              <AntButton size="small" onClick={() => updateTextFormat("textAlign", "center")}>
                <AlignCenter className="w-4 h-4" />
              </AntButton>
              <AntButton size="small" onClick={() => updateTextFormat("textAlign", "right")}>
                <AlignRight className="w-4 h-4" />
              </AntButton>
            </div>

            <div className="toolbar-section">
              <Dropdown overlay={fontSizeMenu} trigger={["click"]}>
                <AntButton size="small">
                  <Type className="w-4 h-4 mr-1" />
                  {newNote.textFormat.fontSize}
                </AntButton>
              </Dropdown>

              <Dropdown overlay={textColorMenu} trigger={["click"]}>
                <AntButton size="small">
                  <Palette className="w-4 h-4" />
                </AntButton>
              </Dropdown>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nội dung</label>
            <Textarea
              placeholder="Viết ghi chú của bạn ở đây..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={6}
              style={{
                fontSize: newNote.textFormat.fontSize,
                fontWeight: newNote.textFormat.fontWeight,
                fontStyle: newNote.textFormat.fontStyle,
                textAlign: newNote.textFormat.textAlign as any,
                color: newNote.textFormat.textColor,
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Màu nền</label>
            <div className="flex space-x-2">
              {["#ffffff", "#fef3c7", "#dbeafe", "#f3e8ff", "#dcfce7", "#fecaca"].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 ${
                    newNote.color === color ? "border-gray-400" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewNote({ ...newNote, color })}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Đính kèm & Ghi âm</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input type="file" multiple onChange={handleFileChange} className="flex-1" />
                {!isRecording ? (
                  <AntButton onClick={startRecording}>
                    <Mic className="w-4 h-4 mr-2" />
                    Ghi âm bài giảng
                  </AntButton>
                ) : (
                  <AntButton onClick={stopRecording}>
                    <MicOff className="w-4 h-4 mr-2" />
                    Dừng ({formatTime(recordingTime)})
                  </AntButton>
                )}
              </div>

              {newNote.attachments.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">File đính kèm:</h5>
                  {newNote.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <Paperclip className="w-4 h-4 mr-2" />
                        <div>
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      </div>
                      <AntButton size="small" onClick={() => removeFile(index)}>
                        <Trash className="w-4 h-4" />
                      </AntButton>
                    </div>
                  ))}
                </div>
              )}

              {audioBlob && (
                <div className="p-3 bg-gray-50 rounded">
                  <h5 className="text-sm font-medium mb-2">Ghi âm bài giảng:</h5>
                  <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thẻ</label>
            <div className="space-y-2">
              <Input
                placeholder="Thêm thẻ và nhấn Enter"
                onPressEnter={(e) => {
                  addTag(e.currentTarget.value)
                  e.currentTarget.value = ""
                }}
              />
              <div className="flex flex-wrap gap-2">
                {newNote.tags.map((tag) => (
                  <Badge key={tag} className="flex items-center">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 text-xs">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Search and Filter */}
      <div className="search-filter">
        <div className="search-input">
          <Search className="search-icon" />
          <Input
            placeholder="Tìm kiếm ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả danh mục</option>
          <option value="teaching">Giảng dạy</option>
          <option value="research">Nghiên cứu</option>
          <option value="admin">Hành chính</option>
          <option value="personal">Cá nhân</option>
        </select>
        <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="filter-select">
          <option value="all">Tất cả thẻ</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="note-card" style={{ backgroundColor: note.color }}>
            <div className="note-header">
              <div className="note-title-section">
                {getCategoryIcon(note.category)}
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <Badge className="category-badge">{getCategoryLabel(note.category)}</Badge>
              </div>
              <AntButton size="small" onClick={() => deleteNote(note.id)}>
                <Trash className="w-4 h-4" />
              </AntButton>
            </div>

            <div className="note-content">
              <div
                className="note-text"
                style={{
                  fontSize: note.textFormat.fontSize,
                  fontWeight: note.textFormat.fontWeight,
                  fontStyle: note.textFormat.fontStyle,
                  textAlign: note.textFormat.textAlign as any,
                  color: note.textFormat.textColor,
                }}
                dangerouslySetInnerHTML={{ __html: note.formattedContent }}
              />

              {note.attachments.length > 0 && (
                <div className="note-attachments">
                  <h5 className="text-sm font-medium mb-2">Đính kèm:</h5>
                  {note.attachments.map((attachment) => (
                    <div key={attachment.id} className="attachment-item">
                      <div className="file-attachment">
                        <Paperclip className="icon" />
                        <span>{attachment.fileName}</span>
                        <AntButton size="small" onClick={() => window.open(attachment.downloadUrl, "_blank")}>
                          <Download className="w-4 h-4" />
                        </AntButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {note.audioRecording && (
                <div className="note-attachments">
                  <h5 className="text-sm font-medium mb-2">Ghi âm bài giảng:</h5>
                  <div className="attachment-item">
                    <audio controls src={note.audioRecording.downloadUrl} />
                  </div>
                </div>
              )}

              {note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map((tag) => (
                    <Badge key={tag} className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="empty-state">
          <StickyNote className="empty-icon" />
          <h3>Không tìm thấy ghi chú</h3>
          <p>
            {searchTerm || selectedTag !== "all" || selectedCategory !== "all"
              ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc."
              : "Bắt đầu tạo ghi chú giảng dạy và nghiên cứu của bạn."}
          </p>
        </div>
      )}
    </div>
  )
}

export default TeacherPadlet
