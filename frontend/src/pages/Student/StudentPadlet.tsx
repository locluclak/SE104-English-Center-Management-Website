// components/Padlet/StudentPadlet.tsx
"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Input, Card, message, Spin, Button as AntButton } from "antd"
import { Plus, Search, StickyNote, Trash, Edit, Eye } from "lucide-react"
import { Button } from "@/components/Ui/Button/button"
import PadletCreateModal from "@/components/PadletCreateModal/PadletCreateModal"
import { MainApiRequest } from "@/services/MainApiRequest"
import "./StudentPadlet.scss"

interface Attachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  mediaType: 'attachment' | 'audio'
  downloadUrl: string
}

interface PadletNote {
  id: string
  title: string
  content: string
  createdDate: string
  updatedDate: string
  attachments: Attachment[]
  audio?: Attachment
  color: string
  textFormat: {
    fontSize: string
    fontWeight: string
    fontStyle: string
    textAlign: string
    textColor: string
  }
}

const StudentPadlet: React.FC = () => {
  const [notes, setNotes] = useState<PadletNote[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [noteToOperate, setNoteToOperate] = useState<PadletNote | null>(null)

  const getFullFileUrl = (filePath: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
    return `${apiUrl.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}`
  }

  useEffect(() => {
    try {
      const tokenString = localStorage.getItem("token")
      if (tokenString) {
        const mockUser = JSON.parse(tokenString)
        if (mockUser && mockUser.id) {
          const idFromStorage = String(mockUser.id)
          setCurrentStudentId(idFromStorage)
        } else {
          setLoadingNotes(false)
        }
      } else {
        setLoadingNotes(false)
      }
    } catch (e) {
      console.error("Lỗi đọc token:", e)
      setLoadingNotes(false)
    }
  }, [])

  const fetchNotes = useCallback(async (ownerId: string) => {
    setLoadingNotes(true)
    try {
      const res = await MainApiRequest.get(`/padlet/notes/${ownerId}`)
      const data = res.data.padlets

      const formatted: PadletNote[] = data.map((p: any) => {
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr)
          const day = String(date.getDate()).padStart(2, '0')
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = date.getFullYear()
          return `${day}/${month}/${year}`
        }

        const createdDate = p.createTime ? formatDate(p.createTime) : "N/A"
        const updatedDate = p.updateTime ? formatDate(p.updateTime) : "N/A"

        const allAttachments: Attachment[] = p.attachmentsData || []
        const regularAttachments: Attachment[] = []
        let audioAttachment: Attachment | undefined

        allAttachments.forEach((att: any) => {
          const attachment: Attachment = {
            id: String(att.id),
            fileName: att.fileName,
            fileSize: att.fileSize,
            fileType: att.fileType,
            mediaType: att.mediaType,
            downloadUrl: att.downloadUrl
          }
          if (attachment.mediaType === 'audio') {
            audioAttachment = attachment
          } else {
            regularAttachments.push(attachment)
          }
        })

        return {
          id: String(p.padletId),
          title: p.padletName,
          content: p.padletContent,
          createdDate,
          updatedDate,
          attachments: regularAttachments,
          audio: audioAttachment,
          color: p.color || "#ffffff",
          textFormat: {
            fontSize: "14px",
            fontWeight: "normal",
            fontStyle: "normal",
            textAlign: "left",
            textColor: "#000000",
          },
        }
      })

      setNotes(formatted)
    } catch (err: any) {
      console.error("Lỗi tải ghi chú:", err)
      message.error("Không thể tải ghi chú.")
    } finally {
      setLoadingNotes(false)
    }
  }, [])

  useEffect(() => {
    if (currentStudentId) {
      fetchNotes(currentStudentId)
    } else {
      setNotes([])
      setLoadingNotes(false)
    }
  }, [currentStudentId, fetchNotes])

  const handleDelete = async (noteId: string) => {
    try {
      await MainApiRequest.delete(`/padlet/delete/${noteId}`)
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      message.success("Đã xoá ghi chú.")
    } catch (err) {
      message.error("Lỗi xoá ghi chú.")
    }
  }

  const handleOpenModal = (mode: typeof modalMode, note?: PadletNote) => {
    setModalMode(mode)
    setNoteToOperate(note || null)
    setIsModalOpen(true)
  }

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loadingNotes) {
    return <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" tip="Đang tải..." /></div>
  }

  return (
    <div className="student-padlet">
      <div className="padlet-header">
        <h2 className="text-2xl font-bold">Ghi chú học tập</h2>
        <Button onClick={() => handleOpenModal("create")} disabled={!currentStudentId}>
          <Plus className="w-4 h-4 mr-2" /> Tạo ghi chú mới
        </Button>
      </div>

      <PadletCreateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => currentStudentId && fetchNotes(currentStudentId)}
        studentId={currentStudentId || ""}
        mode={modalMode}
        defaultData={noteToOperate || undefined}
      />

      <div className="search-filter">
        <Search className="search-icon" />
        <Input
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="notes-grid">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="note-card" style={{ backgroundColor: note.color }}>
            <div className="note-header">
              <StickyNote className="icon" />
              <h3>{note.title}</h3>
              <div className="note-actions">
                <AntButton onClick={() => handleOpenModal("view", note)}><Eye /></AntButton>
                <AntButton onClick={() => handleOpenModal("edit", note)}><Edit /></AntButton>
                <AntButton onClick={() => handleDelete(note.id)}><Trash /></AntButton>
              </div>
            </div>

            <div className="note-content" style={{
              fontSize: note.textFormat.fontSize,
              fontWeight: note.textFormat.fontWeight,
              fontStyle: note.textFormat.fontStyle,
              textAlign: note.textFormat.textAlign as any,
              color: note.textFormat.textColor
            }} dangerouslySetInnerHTML={{ __html: note.content }} />

            {note.audio && (
              <div className="note-audio">
                <h5>Ghi âm:</h5>
                <audio controls>
                  <source src={getFullFileUrl(note.audio.downloadUrl)} type="audio/webm" />
                  <source src={getFullFileUrl(note.audio.downloadUrl)} type="audio/mp3" />
                  Trình duyệt không hỗ trợ phát âm thanh.
                </audio>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StudentPadlet