"use client"

import React, { useEffect, useState } from "react"
import { Modal, Input, Form, Upload, message, Select, UploadFile } from "antd"
import { InboxOutlined } from "@ant-design/icons"
import { MainApiRequest } from "@/services/MainApiRequest"

const { Dragger } = Upload
const { TextArea } = Input
const { Option } = Select

interface PadletCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  mode: "create" | "edit" | "view"
  defaultData?: any
  ownerId: string
}

const PadletCreateModal: React.FC<PadletCreateModalProps> = ({ open, onClose, onSuccess, mode, defaultData, ownerId }) => {
  const [form] = Form.useForm()
  const [content, setContent] = useState<string>("")
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([])
  const isReadOnly = mode === "view"

  useEffect(() => {
    if (open) {
      if (defaultData) {
        form.setFieldsValue({
          title: defaultData.padletName || defaultData.title,
          color: defaultData.color,
        })
        setContent(defaultData.padletContent || defaultData.content || "")

        const defaultAttachments = defaultData.attachmentsData
          ?.filter((att: any) => att.mediaType === 'attachment' || att.mediaType === 'image' || att.mediaType === 'document' || att.mediaType === 'pdf')
          .map((att: any) => ({
            uid: att.id ? String(att.id) : `new-${Math.random()}`,
            name: att.fileName,
            status: 'done',
            url: att.downloadUrl,
          })) || [];

        setFileList(defaultAttachments)
      } else {
        form.resetFields()
        setContent("")
        setFileList([])
      }
      setRemovedAttachmentIds([])
    }
  }, [defaultData, form, open])

  const handleFinish = async (values: any) => {
    try {
      if (!ownerId) {
        message.error("Không xác định được người dùng sở hữu ghi chú.")
        return
      }

      const formData = new FormData()
      formData.append("name", values.title)
      formData.append("content", content)
      formData.append("ownerId", ownerId)
      formData.append("color", values.color || "#ffffff")

      // Append all files that are new uploads
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("attachments", file.originFileObj)
        }
      })

      // Append removed attachment IDs if in edit mode
      if (mode === "edit" && defaultData && removedAttachmentIds.length > 0) {
        formData.append("removeAttachment", JSON.stringify(removedAttachmentIds))
      }

      const endpoint = mode === "edit" && defaultData 
        ? `/padlet/edit/${defaultData.id}`
        : "/padlet/create"
      const method = mode === "edit" ? "put" : "post"

      await MainApiRequest[method](endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      message.success(mode === "edit" ? "Đã cập nhật ghi chú." : "Đã tạo ghi chú mới.")
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Lỗi lưu ghi chú:", err)
      message.error(`Lỗi khi lưu ghi chú: ${err.response?.data?.error || err.message || "Không xác định"}`)
    }
  }

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList)
  }

  const handleRemove = (file: UploadFile) => {
    if (file.uid && typeof file.uid === 'string' && !file.originFileObj) {
      setRemovedAttachmentIds(prev => [...prev, file.uid])
    }
    return true
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
      destroyOnClose={true}
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
            multiple
            disabled={isReadOnly}
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleFileChange}
            onRemove={handleRemove}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Kéo thả hoặc nhấn để tải tệp lên</p>
            <p className="ant-upload-hint">
              Hỗ trợ tải lên nhiều file cùng lúc (ảnh, tài liệu, PDF)
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PadletCreateModal