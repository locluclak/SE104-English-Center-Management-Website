"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Input, Card, message, Spin, Button as AntButton, List, Tag } from "antd"
import { Plus, Search, StickyNote, Trash, Edit, Eye, File, Image, FileText } from "lucide-react"
import { Button } from "@/components/Ui/Button/button"
import PadletCreateModal from "@/components/PadletCreateModal/PadletCreateModal"
import { MainApiRequest } from "@/services/MainApiRequest"
import "./TeacherPadlet.scss"
import { jwtDecode } from "jwt-decode"

interface Attachment {
  id: string
  fileName: string
  fileType: string
  mediaType: string
  downloadUrl: string
}

interface PadletNote {
  id: string
  title: string
  content: string
  createdDate: string
  updatedDate: string
  attachments: Attachment[]
  color: string
  textFormat: {
    fontSize: string
    fontWeight: string
    fontStyle: string
    textAlign: string
    textColor: string
  }
}

const TeacherPadlet: React.FC = () => {
  const [notes, setNotes] = useState<PadletNote[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [noteToOperate, setNoteToOperate] = useState<PadletNote | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4 mr-2" />
    if (fileType === 'application/pdf') return <FileText className="w-4 h-4 mr-2" />
    return <File className="w-4 h-4 mr-2" />
  }

  const getFileTypeTag = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Tag color="blue">Ảnh</Tag>
    if (fileType === 'application/pdf') return <Tag color="red">PDF</Tag>
    if (fileType.startsWith('text/')) return <Tag color="green">Tài liệu</Tag>
    return <Tag>File</Tag>
  }

  const getFullFileUrl = (filePath: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
    return `${apiUrl.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}`
  }

  useEffect(() => {
    const tokenString = localStorage.getItem("token")
    if (tokenString) {
      try {
        const decodedToken: any = jwtDecode(tokenString)
        if (decodedToken && decodedToken.id) {
          setCurrentUserId(decodedToken.id.toString())
        } else if (decodedToken && decodedToken.sub) {
          setCurrentUserId(decodedToken.sub.toString())
        } else {
          console.warn("JWT token does not contain 'id' or 'sub' in payload.")
        }
      } catch (error) {
        console.error("Error parsing or decoding token:", error)
        localStorage.removeItem("token")
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.")
      }
    } else {
      setLoadingNotes(false)
      console.warn("No token found in localStorage.")
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

        const attachments: Attachment[] = (p.attachmentsData || [])
          .filter((att: any) => att.mediaType === 'attachment')
          .map((att: any) => ({
            id: String(att.id),
            fileName: att.fileName,
            fileType: att.fileType,
            mediaType: att.mediaType,
            downloadUrl: att.downloadUrl
          }))

        return {
          id: String(p.padletId),
          title: p.padletName,
          content: p.padletContent,
          createdDate,
          updatedDate,
          attachments,
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
    if (currentUserId) {
      fetchNotes(currentUserId)
    } else {
      setLoadingNotes(false)
    }
  }, [currentUserId, fetchNotes])

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
    <div className="teacher-padlet">
      <div className="padlet-header">
        <h2 className="text-2xl font-bold">Ghi chú Giảng dạy</h2>
        <Button onClick={() => handleOpenModal("create")} disabled={!currentUserId}>
          <Plus className="w-4 h-4 mr-2" /> Tạo ghi chú mới
        </Button>
      </div>

      <PadletCreateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => currentUserId && fetchNotes(currentUserId)}
        mode={modalMode}
        defaultData={noteToOperate || undefined}
        ownerId={currentUserId || ''}
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
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
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

              {note.attachments.length > 0 && (
                <div className="note-attachments">
                  <h5>Tệp đính kèm:</h5>
                  <List
                    size="small"
                    dataSource={note.attachments}
                    renderItem={(file) => (
                      <List.Item className="attachment-item">
                        <div className="flex items-center">
                          {getFileIcon(file.fileType)}
                          <a 
                            href={getFullFileUrl(file.downloadUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mr-2"
                          >
                            {file.fileName}
                          </a>
                          {getFileTypeTag(file.fileType)}
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Card>
          ))
        ) : (
          <p>Không có ghi chú nào được tìm thấy. Vui lòng tạo một ghi chú mới.</p>
        )}
      </div>
    </div>
  )
}

export default TeacherPadlet