import React, { useState, useRef } from "react";
import "./CreatePadlet.css";

export default function CreatePadlet({ padlet, onSubmit, onCancel }) {
  const [title, setTitle] = useState(padlet.title || "");
  const [content, setContent] = useState(padlet.preview || "");
  const [attachment, setAttachment] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setAudioBlob(audioBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedPadlet = {
      ...padlet,
      title,
      preview: content,
      attachment,
      audio: audioBlob,
    };
    onSubmit(updatedPadlet);
  };

  return (
    <div className="create-padlet-overlay">
      <form className="create-padlet-form" onSubmit={handleSubmit}>
        <input
          className="padlet-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề ghi chú"
        />

        <textarea
          className="padlet-content-area"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung..."
        />

        <div style={{ margin: "10px 0" }}>
          <label><strong>📎 Đính kèm tệp:</strong></label><br />
          <input type="file" onChange={handleFileChange} />
          {attachment && <p>✅ Tệp: {attachment.name}</p>}
        </div>

        <div style={{ marginTop: "20px" }}>
          <strong>🎙 Ghi âm:</strong><br />
          {!isRecording ? (
            <button type="button" onClick={startRecording}>▶ Start</button>
          ) : (
            <button type="button" onClick={stopRecording}>⏹ Stop</button>
          )}

          {audioBlob && (
            <div style={{ marginTop: "10px" }}>
              <p>🔊 Replay:</p>
              <audio controls src={URL.createObjectURL(audioBlob)} />
            </div>
          )}
        </div>

        <div className="button-group">
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancle</button>
        </div>
      </form>
    </div>
  );
}