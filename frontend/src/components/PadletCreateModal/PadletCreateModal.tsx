// PadletCreateModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Input,
  Button as AntButton,
  Dropdown,
  Menu,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Mic,
  MicOff,
  Paperclip,
  Trash,
} from "lucide-react";
// import { Textarea } from "@/components/Ui/Textarea/textarea" // Comment/Xóa dòng này
import { MainApiRequest } from "@/services/MainApiRequest";
import AudioRecorderPlayer from "./AudioRecorderPlayer";
import "./PadletCreateModal.scss";

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string; // mimetype
  mediaType: "attachment" | "audio";
  downloadUrl: string;
}

interface PadletCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  studentId: string;
  mode: "create" | "edit" | "view"; // Thêm "view"
  defaultData?: {
    // defaultData có thể là undefined
    id: string;
    title: string;
    content: string;
    attachments: Attachment[]; // Bao gồm cả audio nếu có
    color: string;
    textFormat: {
      fontSize: string;
      fontWeight: string;
      fontStyle: string;
      textAlign: string;
      textColor: string;
    };
  } | null; // defaultData cũng có thể là null
}

const PadletCreateModal: React.FC<PadletCreateModalProps> = ({
  open,
  onClose,
  onSuccess,
  studentId,
  mode,
  defaultData,
}) => {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    []
  ); // Chỉ các attachments thông thường
  const [removedAttachments, setRemovedAttachments] = useState<string[]>([]); // Tên file đã xóa (để gửi lên backend)
  const [noteColor, setNoteColor] = useState("#ffffff");
  const [noteTextFormat, setNoteTextFormat] = useState({
    fontSize: "14px",
    fontWeight: "normal",
    fontStyle: "normal",
    textAlign: "left",
    textColor: "#000000",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null); // Blob cho ghi âm mới
  const [existingAudioAttachment, setExistingAudioAttachment] =
    useState<Attachment | null>(null); // Toàn bộ object Attachment cho audio hiện có
  const [isAudioRemoved, setIsAudioRemoved] = useState(false); // Đánh dấu audio bị xóa
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref cho textarea gốc
  const API_HOST = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, '');
  const existingAudioUrl = existingAudioAttachment?.downloadUrl
    ? new URL(existingAudioAttachment.downloadUrl, API_HOST).href
    : null;

  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        if (defaultData) {
          // Kiểm tra defaultData trước khi truy cập
          setNoteTitle(defaultData.title);
          setNoteContent(defaultData.content);

          // Phân loại attachments từ defaultData
          const regAttachments = defaultData.attachments.filter(
            (att) => att.mediaType === "attachment"
          );
          const audioAtt = defaultData.attachments.find(
            (att) => att.mediaType === "audio"
          );

          setExistingAttachments(regAttachments || []);
          setExistingAudioAttachment(audioAtt || null);
          setNoteColor(defaultData.color || "#ffffff");
          setNoteTextFormat(
            defaultData.textFormat || {
              fontSize: "14px",
              fontWeight: "normal",
              fontStyle: "normal",
              textAlign: "left",
              textColor: "#000000",
            }
          );
          setNewAttachments([]);
          setRemovedAttachments([]);
          setAudioBlob(null);
          setIsAudioRemoved(false);
          setRecordingTime(0);
        }
      } else {
        // mode === "create"
        setNoteTitle("");
        setNoteContent("");
        setNewAttachments([]);
        setExistingAttachments([]);
        setRemovedAttachments([]);
        setNoteColor("#ffffff");
        setNoteTextFormat({
          fontSize: "14px",
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "left",
          textColor: "#000000",
        });
        setAudioBlob(null);
        setExistingAudioAttachment(null);
        setIsAudioRemoved(false);
        setRecordingTime(0);
      }
    }
  }, [open, mode, defaultData]);

  const applyTextFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = noteContent.substring(start, end);

    if (selectedText) {
      let formatted = selectedText;
      if (format === "bold") formatted = `**${selectedText}**`;
      else if (format === "italic") formatted = `*${selectedText}*`;
      else if (format === "underline") formatted = `__${selectedText}__`;
      const newContent =
        noteContent.substring(0, start) +
        formatted +
        noteContent.substring(end);
      setNoteContent(newContent);
      setTimeout(() => {
        textarea.selectionStart = start + formatted.length;
        textarea.selectionEnd = start + formatted.length;
      }, 0);
    }
  };

  const updateTextFormat = (property: string, value: string) => {
    setNoteTextFormat((prev) => ({ ...prev, [property]: value }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) =>
        audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        setExistingAudioAttachment(null); // Khi ghi âm mới, xóa tham chiếu đến audio cũ
        setIsAudioRemoved(false); // Đảm bảo cờ xóa không được bật nếu có audio mới
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(
        () => setRecordingTime((t) => t + 1),
        1000
      );
    } catch (error) {
      message.error("Không thể ghi âm");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordingIntervalRef.current)
      clearInterval(recordingIntervalRef.current);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewAttachments((prev) => [...prev, ...filesArray]);
    }
  };

  const removeNewFile = (index: number) => {
    const updated = newAttachments.filter((_, i) => i !== index);
    setNewAttachments(updated);
  };

  const removeExistingAttachment = (fileName: string) => {
    setExistingAttachments((prev) =>
      prev.filter((att) => att.fileName !== fileName)
    );
    setRemovedAttachments((prev) => [...prev, fileName]);
  };

  const removeAudioFile = () => {
    setAudioBlob(null); // Xóa audio mới nếu có
    setExistingAudioAttachment(null); // Xóa tham chiếu audio cũ
    setIsAudioRemoved(true); // Đánh dấu để xóa audio cũ trên backend
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", noteTitle);
    formData.append("content", noteContent);
    formData.append("ownerId", studentId);
    formData.append("color", noteColor); // Thêm màu nền vào formData

    newAttachments.forEach((file) => formData.append("attachments", file));

    // Nếu có ghi âm mới được tạo
    if (audioBlob) {
      formData.append("audio", audioBlob, `audio_${Date.now()}.wav`);
    }

    // Xử lý các file cần xóa (bao gồm cả audio cũ nếu đã bị xóa)
    const filesToDeleteOnBackend = [...removedAttachments];
    if (isAudioRemoved && existingAudioAttachment) {
      filesToDeleteOnBackend.push(existingAudioAttachment.fileName);
    }
    formData.append("removeAttachment", JSON.stringify(filesToDeleteOnBackend));

    try {
      if (mode === "create") {
        await MainApiRequest.post("/padlet/create", formData);
        message.success("Đã tạo ghi chú");
      } else if (mode === "edit" && defaultData?.id) {
        await MainApiRequest.put(`/padlet/edit/${defaultData.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Đã cập nhật ghi chú");
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Thao tác thất bại:", error);
      message.error(
        "Thao tác thất bại: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fontSizeMenu: MenuProps["items"] = [
    {
      key: "12px",
      label: "12px",
      onClick: () => updateTextFormat("fontSize", "12px"),
    },
    {
      key: "14px",
      label: "14px",
      onClick: () => updateTextFormat("fontSize", "14px"),
    },
    {
      key: "16px",
      label: "16px",
      onClick: () => updateTextFormat("fontSize", "16px"),
    },
    {
      key: "18px",
      label: "18px",
      onClick: () => updateTextFormat("fontSize", "18px"),
    },
    {
      key: "20px",
      label: "20px",
      onClick: () => updateTextFormat("fontSize", "20px"),
    },
  ];

  const textColorMenu: MenuProps["items"] = [
    {
      key: "#000000",
      label: "Đen",
      onClick: () => updateTextFormat("textColor", "#000000"),
    },
    {
      key: "#dc2626",
      label: "Đỏ",
      onClick: () => updateTextFormat("textColor", "#dc2626"),
    },
    {
      key: "#2563eb",
      label: "Xanh dương",
      onClick: () => updateTextFormat("textColor", "#2563eb"),
    },
    {
      key: "#16a34a",
      label: "Xanh lá",
      onClick: () => updateTextFormat("textColor", "#16a34a"),
    },
    {
      key: "#ca8a04",
      label: "Vàng",
      onClick: () => updateTextFormat("textColor", "#ca8a04"),
    },
  ];

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  const isReadOnly = mode === "view"; // Chỉ đọc khi ở chế độ "view"
  const isFormDisabled = isReadOnly || isSubmitting; // Tắt form khi chỉ đọc hoặc đang submit

  return (
    <Modal
      title={
        mode === "create"
          ? "Tạo ghi chú"
          : mode === "edit"
          ? "Chỉnh sửa ghi chú"
          : "Xem ghi chú"
      }
      open={open}
      onCancel={onClose}
      footer={
        isReadOnly // Footer khác nhau cho chế độ xem
          ? [
              <AntButton key="close" onClick={onClose}>
                Đóng
              </AntButton>,
            ]
          : [
              <AntButton key="cancel" onClick={onClose}>
                Hủy
              </AntButton>,
              <AntButton
                key="submit"
                type="primary"
                loading={isSubmitting}
                onClick={handleSubmit}
                disabled={!noteTitle || isFormDisabled}
              >
                {mode === "create" ? "Tạo" : "Cập nhật"}
              </AntButton>,
            ]
      }
      width={800}
    >
      <div className="padlet-modal">
        <div>
          <label className="block text-sm font-medium mb-1">Tiêu đề</label>
          <Input
            disabled={isFormDisabled}
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Nhập tiêu đề ghi chú"
          />
        </div>

        {/* Toolbar định dạng chỉ hiện khi không ở chế độ xem */}
        {!isReadOnly && (
          <div className="text-formatting-toolbar flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
            <AntButton
              size="small"
              onClick={() => applyTextFormat("bold")}
              disabled={isFormDisabled}
              title="In đậm"
            >
              <Bold className="w-4 h-4" />
            </AntButton>
            <AntButton
              size="small"
              onClick={() => applyTextFormat("italic")}
              disabled={isFormDisabled}
              title="In nghiêng"
            >
              <Italic className="w-4 h-4" />
            </AntButton>
            <AntButton
              size="small"
              onClick={() => applyTextFormat("underline")}
              disabled={isFormDisabled}
              title="Gạch chân"
            >
              <Underline className="w-4 h-4" />
            </AntButton>

            <AntButton
              size="small"
              onClick={() => updateTextFormat("textAlign", "left")}
              disabled={isFormDisabled}
              title="Căn trái"
            >
              <AlignLeft className="w-4 h-4" />
            </AntButton>
            <AntButton
              size="small"
              onClick={() => updateTextFormat("textAlign", "center")}
              disabled={isFormDisabled}
              title="Căn giữa"
            >
              <AlignCenter className="w-4 h-4" />
            </AntButton>
            <AntButton
              size="small"
              onClick={() => updateTextFormat("textAlign", "right")}
              disabled={isFormDisabled}
              title="Căn phải"
            >
              <AlignRight className="w-4 h-4" />
            </AntButton>

            <Dropdown menu={{ items: fontSizeMenu }} trigger={["click"]}>
              <AntButton size="small" disabled={isFormDisabled} title="Cỡ chữ">
                <Type className="w-4 h-4" />
                {noteTextFormat.fontSize}
              </AntButton>
            </Dropdown>

            <Dropdown menu={{ items: textColorMenu }} trigger={["click"]}>
              <AntButton size="small" disabled={isFormDisabled} title="Màu chữ">
                <Palette className="w-4 h-4" />
              </AntButton>
            </Dropdown>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nội dung</label>
          {/* Thay thế Textarea tùy chỉnh bằng textarea HTML gốc để ref hoạt động */}
          <textarea
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
              width: "100%",
              padding: "8px",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              resize: "vertical",
              boxSizing: "border-box", // Để padding không làm tăng width
            }}
            ref={textareaRef}
            placeholder="Viết ghi chú của bạn ở đây..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Màu nền</label>
          <div className="flex flex-wrap gap-3">
            {[
              "#ffffff",
              "#fef3c7",
              "#dbeafe",
              "#f3e8ff",
              "#dcfce7",
              "#fecaca",
            ].map((color) => (
              <button
                key={color}
                className={`w-10 h-10 rounded border-2 ${
                  noteColor === color
                    ? "border-gray-400 ring-2 ring-blue-500"
                    : "border-gray-200"
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
          <label className="block text-sm font-medium mb-1">
            Đính kèm & Ghi âm
          </label>
          {!isReadOnly && (
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mb-2"
            />
          )}

          {existingAttachments.length > 0 && (
            <div className="space-y-2 mb-2">
              <h5 className="text-sm font-medium">File đã đính kèm:</h5>
              {existingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex justify-between items-center p-2 bg-gray-100 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4" />
                    <span>{att.fileName}</span>
                  </div>
                  {!isReadOnly && (
                    <AntButton
                      size="small"
                      onClick={() => removeExistingAttachment(att.fileName)}
                    >
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
                <div
                  key={file.name + idx}
                  className="flex justify-between items-center p-2 bg-gray-100 rounded"
                >
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
          <AudioRecorderPlayer
            mode={mode}
            existingAudioUrl={existingAudioUrl}
            onAudioBlobChange={(blob) => {
              setAudioBlob(blob);
              // Nếu có ghi âm mới, ta không còn xóa audio cũ nữa
              if (blob) {
                setIsAudioRemoved(false);
              }
            }}
            onAudioRemove={() => {
              setAudioBlob(null);
              // Chỉ đánh dấu xóa audio cũ nếu nó thực sự tồn tại
              if(existingAudioAttachment) {
                 setIsAudioRemoved(true);
              }
              setExistingAudioAttachment(null);
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default PadletCreateModal;
