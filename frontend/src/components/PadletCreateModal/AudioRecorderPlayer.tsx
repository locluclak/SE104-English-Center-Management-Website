"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button as AntButton, message } from "antd"
import { Mic, MicOff, Trash } from "lucide-react"

interface AudioRecorderPlayerProps {
  mode: "create" | "edit" | "view"
  existingAudioUrl?: string | null
  onAudioBlobChange?: (blob: Blob | null) => void
  onAudioRemove?: () => void
}

const AudioRecorderPlayer: React.FC<AudioRecorderPlayerProps> = ({
  mode,
  existingAudioUrl,
  onAudioBlobChange,
  onAudioRemove,
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const isReadOnly = mode === "view"

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(blob)
        onAudioBlobChange?.(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      intervalRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } catch {
      message.error("Không thể truy cập micro")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const removeAudio = () => {
    setAudioBlob(null)
    onAudioBlobChange?.(null)
    onAudioRemove?.()
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  return (
    <div>
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

      {(audioBlob || existingAudioUrl) && (
        <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
          <audio
            controls
            src={audioBlob ? URL.createObjectURL(audioBlob) : existingAudioUrl || ""}
            className="flex-grow"
          />
          {!isReadOnly && (
            <AntButton size="small" onClick={removeAudio}>
              <Trash className="w-4 h-4" />
            </AntButton>
          )}
        </div>
      )}
    </div>
  )
}

export default AudioRecorderPlayer
