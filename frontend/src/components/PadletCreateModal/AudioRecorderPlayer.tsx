// components/Padlet/AudioRecorderPlayer.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button, Space } from "antd"

interface AudioRecorderPlayerProps {
  disabled?: boolean
  defaultAudioUrl?: string
  onAudioRecorded?: (file: File, url: string) => void
}

const AudioRecorderPlayer: React.FC<AudioRecorderPlayerProps> = ({ disabled, defaultAudioUrl, onAudioRecorded }) => {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(defaultAudioUrl || null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        const file = new File([blob], "recording.webm", { type: "audio/webm" })
        onAudioRecorded?.(file, url)

        // stop mic access
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      console.error("Không thể bắt đầu ghi âm:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const removeAudio = () => {
    setAudioUrl(null)
    onAudioRecorded?.(null as any, "")
  }

  useEffect(() => {
    setAudioUrl(defaultAudioUrl || null)
  }, [defaultAudioUrl])

  return (
    <div>
      <Space>
        {!disabled && !recording && <Button onClick={startRecording}>Ghi âm</Button>}
        {!disabled && recording && <Button danger onClick={stopRecording}>Dừng</Button>}
        {audioUrl && <audio controls src={audioUrl} style={{ marginTop: 8 }} />}
        {audioUrl && !disabled && <Button onClick={removeAudio}>Xoá ghi âm</Button>}
      </Space>
    </div>
  )
}

export default AudioRecorderPlayer