// StudentPadlet.tsx
"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Card, Input, Button as AntButton, message, Spin } from "antd"
import { Plus, Search, StickyNote, Trash, Download, Paperclip, Edit } from "lucide-react"
import { Button } from "@/components/Ui/Button/button"
import PadletCreateModal from "@/components/PadletCreateModal/PadletCreateModal"
import { MainApiRequest } from "@/services/MainApiRequest" // Đảm bảo đường dẫn này đúng

import "./StudentPadlet.scss"

interface PadletNote {
  id: string
  title: string
  content: string
  createdDate: string
  updatedDate: string
  attachments: {
    id: string
    fileName: string
    fileSize: string
    fileType: string
    downloadUrl: string
  }[]
  color: string
  textFormat: {
    fontSize: string
    fontWeight: string
    fontStyle: string
    textAlign: string
    textColor: string
  }
}

interface StudentPadletProps {
  // Bỏ studentId và userRole khỏi props vì lấy từ localStorage
}

const StudentPadlet: React.FC<StudentPadletProps> = () => {
  const [notes, setNotes] = useState<PadletNote[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [noteToEdit, setNoteToEdit] = useState<PadletNote | null>(null)

  // --- Lấy studentId từ localStorage khi component mount ---
  useEffect(() => {
    try {
      const tokenString = localStorage.getItem("token")
      if (tokenString) {
        const mockUser = JSON.parse(tokenString)
        if (mockUser && mockUser.id) {
          const idFromStorage = String(mockUser.id)
          setCurrentStudentId(idFromStorage)
          console.log("Student ID from localStorage:", idFromStorage) //
        } else {
          console.warn("Token trong localStorage không chứa ID hợp lệ.")
          setLoadingNotes(false)
        }
      } else {
        console.warn("Không tìm thấy 'token' trong localStorage.")
        setLoadingNotes(false)
      }
    } catch (e) {
      console.error("Lỗi khi đọc 'token' từ localStorage:", e)
      setLoadingNotes(false)
    }
  }, [])

  // --- Hàm fetchNotes ---
  const fetchNotes = useCallback(async (ownerId: string) => {
    setLoadingNotes(true)
    try {
      const res = await MainApiRequest.get(`/padlet/notes/${ownerId}`)
      const data = res.data.padlets

      const formatted: PadletNote[] = data.map((p: any) => {
        // Cải thiện xử lý createTime và attachmentNames để tránh lỗi null.split()
        const createdDate = p.createTime ? p.createTime.split("T")[0] : "N/A"
        const updatedDate = p.createTime ? p.createTime.split("T")[0] : "N/A"

        // Xử lý attachmentNames: đảm bảo là mảng và lọc bỏ null
        const attachments = (Array.isArray(p.attachmentNames)
          ? p.attachmentNames.filter((name: string | null) => name !== null) as string[] // Ép kiểu sau khi lọc
          : []
        ).map((fileName: string) => ({
              id: `${p.padletId}-${fileName}`,
              fileName,
              fileSize: "N/A",
              fileType: fileName.split(".").pop() || "unknown",
              downloadUrl: `http://localhost:3000/uploads/${fileName}`,
            }));

        return {
          id: String(p.padletId),
          title: p.padletName,
          content: p.padletContent,
          createdDate: createdDate,
          updatedDate: updatedDate,
          attachments: attachments,
          color: "#ffffff",
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
      console.error("Lỗi tải ghi chú:", err) //
      if (err.response && err.response.status !== 404) {
          message.error("Không thể tải ghi chú.");
      } else if (!err.response) {
          message.error("Không thể tải ghi chú. Vui lòng kiểm tra kết nối mạng hoặc server.");
      } else if (err.response.status === 404) {
          message.info("Chưa có ghi chú nào. Hãy tạo ghi chú mới!"); // Thông báo thân thiện hơn cho 404
      }
    } finally {
      setLoadingNotes(false)
    }
  }, [])

  // --- Gọi fetchNotes khi currentStudentId thay đổi ---
  useEffect(() => {
    if (currentStudentId) {
      fetchNotes(currentStudentId)
    } else {
        setNotes([]);
        setLoadingNotes(false);
        console.warn("Không có studentId để tải ghi chú."); //
    }
  }, [currentStudentId, fetchNotes])

  // --- Xử lý xóa ghi chú ---
  const handleDelete = async (noteId: string) => {
    if (!currentStudentId) {
        message.error("ID người dùng không có sẵn để xóa ghi chú.");
        return;
    }
    try {
      await MainApiRequest.delete(`/padlet/delete/${noteId}`)
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      message.success("Đã xoá ghi chú.")
    } catch (err) {
      console.error("Lỗi xoá ghi chú:", err)
      message.error("Lỗi xoá ghi chú.")
    }
  }

  // --- Mở modal tạo ghi chú ---
  const handleOpenCreateModal = () => {
    if (!currentStudentId) {
        message.error("ID người dùng không có sẵn để tạo ghi chú. Vui lòng kiểm tra localStorage.");
        return;
    }
    setIsCreateModalOpen(true);
  };

  // --- Mở modal chỉnh sửa ---
  const handleOpenEditModal = (note: PadletNote) => {
    if (!currentStudentId) {
      message.error("ID người dùng không có sẵn để chỉnh sửa ghi chú.");
      return;
    }
    setNoteToEdit(note);
    setIsEditModalOpen(true);
  };

  // --- Lọc ghi chú ---
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // --- Hiển thị loading spinner ---
  if (loadingNotes) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải ghi chú học tập..." />
      </div>
    );
  }

  return (
    <div className="student-padlet">
      {/* Header */}
      <div className="padlet-header">
        <h2 className="text-2xl font-bold text-gray-900">Ghi chú học tập của tôi</h2>
        <Button className="create-note-btn" onClick={handleOpenCreateModal} disabled={!currentStudentId}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo ghi chú mới
        </Button>
      </div>

      {/* Modal Tạo ghi chú */}
      <PadletCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => currentStudentId && fetchNotes(currentStudentId)}
        studentId={currentStudentId || ""}
        mode="create"
      />

      {/* Modal Chỉnh sửa ghi chú */}
      {noteToEdit && (
        <PadletCreateModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => currentStudentId && fetchNotes(currentStudentId)}
          studentId={currentStudentId || ""}
          mode="edit"
          defaultData={noteToEdit}
        />
      )}

      {/* Thanh tìm kiếm */}
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
      </div>

      {/* Lưới Ghi chú */}
      <div className="notes-grid">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="note-card" style={{ backgroundColor: note.color }}>
            <div className="note-header">
              <div className="note-title-section">
                <StickyNote className="icon" />
                <h3 className="text-lg font-semibold">{note.title}</h3>
              </div>
              <div className="note-actions">
                <AntButton size="small" onClick={() => handleOpenEditModal(note)} title="Chỉnh sửa ghi chú">
                    <Edit className="w-4 h-4" />
                </AntButton>
                <AntButton size="small" onClick={() => handleDelete(note.id)} title="Xóa ghi chú">
                  <Trash className="w-4 h-4" />
                </AntButton>
              </div>
            </div>

            <div
              className="note-content"
              style={{
                fontSize: note.textFormat.fontSize,
                fontWeight: note.textFormat.fontWeight,
                fontStyle: note.textFormat.fontStyle,
                textAlign: note.textFormat.textAlign as any,
                color: note.textFormat.textColor,
              }}
            >
              <div className="note-text" dangerouslySetInnerHTML={{ __html: note.content }} />
            </div>

            {note.attachments.length > 0 && (
              <div className="note-attachments">
                <h5 className="text-sm font-medium mb-2">Đính kèm:</h5>
                {note.attachments.map((att) => (
                  <div key={att.id} className="attachment-item">
                    <div className="file-attachment">
                      <Paperclip className="icon" />
                      <span>{att.fileName}</span>
                      <AntButton
                        size="small"
                        onClick={() => window.open(att.downloadUrl, "_blank")}
                        title="Tải xuống"
                      >
                        <Download className="w-4 h-4" />
                      </AntButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
             <div className="note-footer text-xs text-gray-500 mt-2">
                Ngày tạo: {note.createdDate}
            </div>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && !loadingNotes && (
        <div className="empty-state">
          <StickyNote className="empty-icon" />
          {currentStudentId ? (
            <h3>{searchTerm ? "Không tìm thấy ghi chú nào khớp với tìm kiếm." : "Bạn chưa có ghi chú học tập nào."}</h3>
          ) : (
            <h3>Không tìm thấy ID người dùng.</h3>
          )}
          <p>
            {searchTerm
              ? "Thử điều chỉnh tiêu chí tìm kiếm."
              : currentStudentId ? "Bắt đầu tạo ghi chú học tập cá nhân của bạn để chúng xuất hiện ở đây." : "Vui lòng đảm bảo bạn đã đăng nhập hoặc dữ liệu ID test có trong localStorage."}
          </p>
        </div>
      )}
    </div>
  )
}

export default StudentPadlet