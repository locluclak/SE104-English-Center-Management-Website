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
  ownerId?: string
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [noteToOperate, setNoteToOperate] = useState<PadletNote | null>(null)

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  useEffect(() => {
    const tokenString = localStorage.getItem("token")
    if (tokenString) {
      try {
        const decodedToken: any = jwtDecode(tokenString)
        if (decodedToken && (decodedToken.id || decodedToken.sub)) {
          setCurrentUserId(decodedToken.id || decodedToken.sub)
        }
      } catch (error) {
        console.error("Token decode error:", error)
      }
    }
  }, [])

  const fetchNotes = useCallback(async (ownerId: string) => {
        setLoadingNotes(true)
        try {
          const res = await MainApiRequest.get(`/padlet/notes/${ownerId}`)
          const formatted = res.data.padlets
              // Thêm bộ lọc này để loại bỏ các đối tượng rỗng hoặc thiếu ID
            .filter((p: any) => p && p.id && typeof p.id !== 'undefined' && p.id !== null) 
            .map((p: any) => ({
              id: String(p.id), // Đảm bảo lấy id từ p.id (như trong response của bạn)
              title: p.padletName,
              content: p.padletContent,
              createdDate: p.createTime ? formatDate(p.createTime) : "N/A",
              updatedDate: p.updateTime ? formatDate(p.updateTime) : "N/A",
              attachments: (p.attachmentsData || [])
                .filter((att: any) => att && att.mediaType === 'attachment' && att.id) // Lọc attachment lỗi
                .map((att: any) => ({
                  id: String(att.id),
                  fileName: att.fileName,
                  fileType: att.fileType,
                  mediaType: att.mediaType,
                  downloadUrl: att.downloadUrl
                })),
              color: p.color || "#ffffff",
              ownerId: p.ownerId,
              textFormat: {
                fontSize: "14px",
                fontWeight: "normal",
                fontStyle: "normal",
                textAlign: "left",
                textColor: "#000000",
              },
            }));
          setNotes(formatted)
        } catch (err) {
          console.error("Fetch notes error:", err)
          message.error("Không thể tải ghi chú")
        } finally {
          setLoadingNotes(false)
        }
      }, [])

  useEffect(() => {
    if (currentUserId) {
      fetchNotes(currentUserId)
    }
  }, [currentUserId, fetchNotes])

  const handleDelete = async (noteId: string) => {
    console.log("Attempting to delete note with ID:", noteId);
    try {
      const confirm = window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")
      if (!confirm) return
      
      await MainApiRequest.delete(`/padlet/delete/${noteId}`)
      setNotes(prev => prev.filter(n => n.id !== noteId))
      message.success("Đã xoá ghi chú thành công")
    } catch (err) {
      const error = err as Error
      console.error("Delete error:", error.message)
      message.error(`Xoá ghi chú thất bại: ${error.message}`)
    }
  }

  const handleOpenModal = (mode: "create" | "edit" | "view", note?: PadletNote) => {
    if (mode === "edit" && note?.ownerId !== currentUserId) {
      message.warning("Bạn không có quyền chỉnh sửa ghi chú này")
      return
    }
    
    setModalMode(mode)
    setNoteToOperate(note || null)
    setIsModalOpen(true)
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loadingNotes) {
    return <div className="flex justify-center p-10"><Spin size="large" tip="Đang tải..." /></div>
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
                  <AntButton onClick={() => handleOpenModal("view", note)} icon={<Eye />} />
                  <AntButton 
                    onClick={() => handleOpenModal("edit", note)} 
                    icon={<Edit />} 
                    //disabled={!currentUserId || note.ownerId !== currentUserId}
                  />
                  <AntButton 
                    onClick={() => handleDelete(note.id)} 
                    icon={<Trash />}
                    //disabled={!currentUserId || note.ownerId !== currentUserId}
                  />
                </div>
              </div>

              <div className="note-content" dangerouslySetInnerHTML={{ __html: note.content }} />

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
          <p className="text-center py-10">Không có ghi chú nào được tìm thấy</p>
        )}
      </div>
    </div>
  )
}

export default TeacherPadlet