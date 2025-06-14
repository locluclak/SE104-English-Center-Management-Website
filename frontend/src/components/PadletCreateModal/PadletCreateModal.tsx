// components/Padlet/PadletCreateModal.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Modal, Input, Form, Upload, message, Select, UploadFile } from "antd"
import { InboxOutlined } from "@ant-design/icons"
import AudioRecorderPlayer from "./AudioRecorderPlayer"
import { MainApiRequest } from "@/services/MainApiRequest"

const { Dragger } = Upload
const { TextArea } = Input
const { Option } = Select

interface PadletCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  studentId: string
  mode: "create" | "edit" | "view"
  defaultData?: any
}

const PadletCreateModal: React.FC<PadletCreateModalProps> = ({ open, onClose, onSuccess, studentId, mode, defaultData }) => {
  const [form] = Form.useForm()
  const [content, setContent] = useState<string>("")
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([])
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [keepOldAudio, setKeepOldAudio] = useState<boolean>(false)
  const isReadOnly = mode === "view"

  useEffect(() => {
  if (open) {
    if (defaultData) {
      form.setFieldsValue({
        title: defaultData.padletName || defaultData.title,
        color: defaultData.color,
      })
      setContent(defaultData.padletContent || defaultData.content || "")

      const defaultAttachments = defaultData.attachmentsData?.filter((att: any) => att.mediaType === 'attachment')?.map((att: any) => ({
        uid: att.id?.toString(),
        name: att.fileName,
        status: 'done',
        url: `/${att.downloadUrl}` // thêm dấu `/` nếu path là tương đối
      })) || []

      setFileList(defaultAttachments)

      const hasAudio = !!defaultData.attachmentsData?.find((att: any) => att.mediaType === 'audio')
      setKeepOldAudio(hasAudio)
    } else {
      form.resetFields()
      setContent("")
      setFileList([])
      setAudioBlob(null)
      setKeepOldAudio(false)
    }
    setRemovedAttachmentIds([])
  }
}, [defaultData, form, open])


  const handleFinish = async (values: any) => {
    try {
      const formData = new FormData()
      formData.append("name", values.title)
      formData.append("content", content)
      formData.append("ownerId", studentId)
      formData.append("color", values.color || "#ffffff")

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("attachments", file.originFileObj)
        }
      })

      if (audioBlob) {
        formData.append("audio", audioBlob, "recording.webm")
        if (mode === "edit" && defaultData?.audio) {
          formData.append("removeAudio", "true")
        }
      } else if (mode === "edit" && defaultData?.audio && !keepOldAudio) {
        formData.append("removeAudio", "true")
      }

      if (mode === "edit" && defaultData) {
        if (removedAttachmentIds.length > 0) {
          formData.append("removeAttachment", JSON.stringify(removedAttachmentIds))
        }
        await MainApiRequest.put(`/padlet/edit/${defaultData.id}`, formData)
        message.success("Đã cập nhật ghi chú.")
      } else {
        await MainApiRequest.post("/padlet/create", formData)
        message.success("Đã tạo ghi chú mới.")
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Lỗi lưu ghi chú:", err)
      message.error("Lỗi khi lưu ghi chú.")
    }
  }

  const handleFileChange = ({ fileList: newList, file }: { fileList: UploadFile[], file: UploadFile }) => {
    if (file.status === 'removed' && file.uid) {
      setRemovedAttachmentIds((prev) => [...prev, file.uid as string])
    }
    setFileList(newList)
  }

  const handleAudioRecorded = (file: Blob | null, url: string | null) => {
    setAudioBlob(file)
    setKeepOldAudio(!!file || (!!defaultData?.audio && url !== null))
  }

  return (
    <Modal
      title={mode === "create" ? "Tạo ghi chú mới" : mode === "edit" ? "Chỉnh sửa ghi chú" : "Xem ghi chú"}
      open={open}
      onCancel={onClose}
      onOk={form.submit}
      okText={mode === "view" ? "Đóng" : "Lưu"}
      okButtonProps={{ disabled: isReadOnly }}
      cancelButtonProps={{ style: { display: isReadOnly ? "none" : undefined } }}
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: "Nhập tiêu đề" }]}> 
          <Input disabled={isReadOnly} />
        </Form.Item>

        <Form.Item label="Màu nền" name="color">
          <Select disabled={isReadOnly}>
            <Option value="#ffffff">Trắng</Option>
            <Option value="#fef3c7">Vàng nhạt</Option>
            <Option value="#d1fae5">Xanh lá nhạt</Option>
            <Option value="#e0e7ff">Xanh dương nhạt</Option>
            <Option value="#fce7f3">Hồng nhạt</Option>
            <Option value="#dbeafe">Xám xanh nhạt</Option>
            <Option value="#fff7ed">Cam nhạt</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Nội dung">
          <TextArea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isReadOnly}
            placeholder="Nhập nội dung ghi chú..."
          />
        </Form.Item>

        <Form.Item label="Tệp đính kèm">
          <Dragger
            className="h-14"
            disabled={isReadOnly}
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleFileChange}
            onRemove={() => true}
          >
            <span><InboxOutlined /> Tải tệp</span>
          </Dragger>
        </Form.Item>

        <Form.Item label="Ghi âm">
          <AudioRecorderPlayer
            disabled={isReadOnly}
            onAudioRecorded={handleAudioRecorded}
            defaultAudioUrl={defaultData?.audio?.downloadUrl || null}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PadletCreateModal