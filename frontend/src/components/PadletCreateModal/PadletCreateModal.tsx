// PadletCreateModal.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import { Modal, Input, Button as AntButton, Dropdown, Menu, message } from "antd"
import type { MenuProps } from 'antd'; // Import MenuProps để định nghĩa kiểu cho menu items
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette, Mic, MicOff, Paperclip, Trash } from "lucide-react"
import { Textarea } from "@/components/Ui/Textarea/textarea"
import { MainApiRequest } from "@/services/MainApiRequest"
import "./PadletCreateModal.scss"


interface Attachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  downloadUrl: string;
}

interface PadletCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  studentId: string
  mode: "create" | "edit" // Bỏ "view" để tránh lỗi so sánh
  defaultData?: { // Dữ liệu khi ở chế độ edit
    id: string
    title: string
    content: string
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
}

const PadletCreateModal: React.FC<PadletCreateModalProps> = ({ open, onClose, onSuccess, studentId, mode, defaultData }) => {
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [newAttachments, setNewAttachments] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([])
  const [removedAttachments, setRemovedAttachments] = useState<string[]>([])
  const [noteColor, setNoteColor] = useState("#ffffff")
  const [noteTextFormat, setNoteTextFormat] = useState({
    fontSize: "14px",
    fontWeight: "normal",
    fontStyle: "normal",
    textAlign: "left",
    textColor: "#000000",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset form và load defaultData khi modal mở/đóng hoặc mode/defaultData thay đổi
  useEffect(() => {
    if (open) {
      if (mode === "edit" && defaultData) {
        setNoteTitle(defaultData.title)
        setNoteContent(defaultData.content)
        setExistingAttachments(defaultData.attachments || [])
        setNoteColor(defaultData.color || "#ffffff")
        setNoteTextFormat(defaultData.textFormat || {
          fontSize: "14px", fontWeight: "normal", fontStyle: "normal",
          textAlign: "left", textColor: "#000000",
        })
        setNewAttachments([])
        setRemovedAttachments([])
        setAudioBlob(null)
        setRecordingTime(0)
      } else {
        setNoteTitle("")
        setNoteContent("")
        setNewAttachments([])
        setExistingAttachments([])
        setRemovedAttachments([])
        setNoteColor("#ffffff")
        setNoteTextFormat({
          fontSize: "14px", fontWeight: "normal", fontStyle: "normal",
          textAlign: "left", textColor: "#000000",
        })
        setAudioBlob(null)
        setRecordingTime(0)
      }
    }
  }, [open, mode, defaultData])

  const applyTextFormat = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = noteContent.substring(start, end)

    if (selectedText) {
      let formatted = selectedText
      if (format === "bold") formatted = `**${selectedText}**`
      else if (format === "italic") formatted = `*${selectedText}*`
      else if (format === "underline") formatted = `__${selectedText}__`
      const newContent = noteContent.substring(0, start) + formatted + noteContent.substring(end)
      setNoteContent(newContent)
      setTimeout(() => {
        textarea.selectionStart = start + formatted.length
        textarea.selectionEnd = start + formatted.length
      }, 0)
    }
  }

  const updateTextFormat = (property: string, value: string) => {
    setNoteTextFormat(prev => ({ ...prev, [property]: value }))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data)
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      recordingIntervalRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } catch (error) {
      message.error("Không thể ghi âm")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setNewAttachments(prev => [...prev, ...filesArray])
    }
  }

  const removeNewFile = (index: number) => {
    const updated = newAttachments.filter((_, i) => i !== index)
    setNewAttachments(updated)
  }

  const removeExistingAttachment = (fileName: string) => {
    setExistingAttachments(prev => prev.filter(att => att.fileName !== fileName))
    setRemovedAttachments(prev => [...prev, fileName])
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("name", noteTitle)
    formData.append("content", noteContent)
    formData.append("ownerId", studentId)
    // Thêm màu nền vào formData (nếu backend hỗ trợ lưu)
    // formData.append("color", noteColor); 

    newAttachments.forEach((file) => formData.append("attachments", file))
    formData.append("removeAttachment", JSON.stringify(removedAttachments)) // Gửi mảng tên file cần xóa

    try {
      if (mode === "create") {
        await MainApiRequest.post("/padlet/create", formData)
        message.success("Đã tạo ghi chú")
      } else if (mode === "edit" && defaultData?.id) {
        await MainApiRequest.put(`/padlet/edit/${defaultData.id}`, formData, { // Đổi sang /padlet/edit/
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        message.success("Đã cập nhật ghi chú")
      }
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error("Thao tác thất bại:", error);
      message.error("Thao tác thất bại: " + (error.response?.data?.error || error.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const fontSizeMenu: MenuProps['items'] = [
    { key: "12px", label: "12px" },
    { key: "14px", label: "14px" },
    { key: "16px", label: "16px" },
    { key: "18px", label: "18px" },
    { key: "20px", label: "20px" },
  ];


  const textColorMenu: MenuProps['items'] = [
    { key: "#000000", label: "Đen" },
    { key: "#dc2626", label: "Đỏ" },
    { key: "#2563eb", label: "Xanh dương" },
    { key: "#16a34a", label: "Xanh lá" },
    { key: "#ca8a04", label: "Vàng" },
  ];

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`

  // Loại bỏ biến readOnly nếu không có chế độ "view"
  // const readOnly = mode === "view"
  const isReadOnly = mode === "edit" && !open; // Hoặc một logic khác nếu bạn muốn disable form khi không phải edit

  return (
    <Modal
      title={mode === "create" ? "Tạo ghi chú" : "Chỉnh sửa ghi chú"}
      open={open}
      onCancel={onClose}
      footer={
        // Không kiểm tra mode === "view" nữa
        [
            <AntButton key="cancel" onClick={onClose}>
              Hủy
            </AntButton>,
            <AntButton key="submit" type="primary" loading={isSubmitting} onClick={handleSubmit} disabled={!noteTitle}>
              {mode === "create" ? "Tạo" : "Cập nhật"}
            </AntButton>,
          ]
      }
      width={800}
    >
      <div className="padlet-modal">
        <div>
          <label className="block text-sm font-medium mb-1">Tiêu đề</label>
          <Input disabled={isReadOnly} value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Nhập tiêu đề ghi chú"/>
        </div>

        <div className="text-formatting-toolbar flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
          <AntButton size="small" onClick={() => applyTextFormat("bold")} disabled={isReadOnly} title="In đậm">
            <Bold className="w-4 h-4" />
          </AntButton>
          <AntButton size="small" onClick={() => applyTextFormat("italic")} disabled={isReadOnly} title="In nghiêng">
            <Italic className="w-4 h-4" />
          </AntButton>
          <AntButton size="small" onClick={() => applyTextFormat("underline")} disabled={isReadOnly} title="Gạch chân">
            <Underline className="w-4 h-4" />
          </AntButton>

          <AntButton size="small" onClick={() => updateTextFormat("textAlign", "left")} disabled={isReadOnly} title="Căn trái">
            <AlignLeft className="w-4 h-4" />
          </AntButton>
          <AntButton size="small" onClick={() => updateTextFormat("textAlign", "center")} disabled={isReadOnly} title="Căn giữa">
            <AlignCenter className="w-4 h-4" />
          </AntButton>
          <AntButton size="small" onClick={() => updateTextFormat("textAlign", "right")} disabled={isReadOnly} title="Căn phải">
            <AlignRight className="w-4 h-4" />
          </AntButton>

          <Dropdown menu={{ items: fontSizeMenu }} trigger={["click"]}>
            <AntButton size="small" disabled={isReadOnly} title="Cỡ chữ">
              <Type className="w-4 h-4" />
              {noteTextFormat.fontSize}
            </AntButton>
          </Dropdown>

          <Dropdown menu={{ items: textColorMenu }} trigger={["click"]}>
            <AntButton size="small" disabled={isReadOnly} title="Màu chữ">
              <Palette className="w-4 h-4" />
            </AntButton>
          </Dropdown>
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Nội dung</label>
            <Textarea
              rows={6}
              readOnly={isReadOnly}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              style={{
                fontSize: noteTextFormat.fontSize,
                fontWeight: noteTextFormat.fontWeight,
                fontStyle: noteTextFormat.fontStyle,
                textAlign: noteTextFormat.textAlign as any,
                color: noteTextFormat.textColor,
              }}
            />
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Màu nền</label>
            <div className="flex flex-wrap gap-3">
              {["#ffffff", "#fef3c7", "#dbeafe", "#f3e8ff", "#dcfce7", "#fecaca"].map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded border-2 ${
                    noteColor === color ? "border-gray-400 ring-2 ring-blue-500" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNoteColor(color)}
                  title={`Chọn màu ${color}`}
                  disabled={isReadOnly}
                />
              ))}
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Đính kèm & Ghi âm</label>
          {!isReadOnly && <input type="file" multiple onChange={handleFileChange} className="mb-2" />}

          {mode === "edit" && existingAttachments.length > 0 && (
            <div className="space-y-2 mb-2">
              <h5 className="text-sm font-medium">File đã đính kèm:</h5>
              {existingAttachments.map((att) => (
                <div key={att.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4" />
                    <span>{att.fileName}</span>
                  </div>
                  {!isReadOnly && (
                    <AntButton size="small" onClick={() => removeExistingAttachment(att.fileName)}>
                      <Trash className="w-4 h-4" />
                    </AntButton>
                  )}
                </div>
              ))}
            </div>
          )}

          {newAttachments.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">File mới thêm:</h5>
              {newAttachments.map((file, idx) => (
                <div key={file.name + idx} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4" />
                    <span>{file.name}</span>
                  </div>
                  {!isReadOnly && (
                    <AntButton size="small" onClick={() => removeNewFile(idx)}>
                      <Trash className="w-4 h-4" />
                    </AntButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ghi âm</label>
          {!isReadOnly && (
            <div className="flex gap-2 mb-2">
              {!isRecording ? (
                <AntButton onClick={startRecording}>
                  <Mic className="w-4 h-4 mr-1" />
                  Ghi âm
                </AntButton>
              ) : (
                <AntButton onClick={stopRecording}>
                  <MicOff className="w-4 h-4 mr-1" />
                  Dừng ({formatTime(recordingTime)})
                </AntButton>
              )}
            </div>
          )}
          {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />}
        </div>
      </div>
    </Modal>
  )
}

export default PadletCreateModal