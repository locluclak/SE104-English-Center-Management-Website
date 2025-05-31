import React, { useState, useRef } from "react";
import "./CreatePadlet.css";

export default function CreatePadlet({ padlet, onSubmit, onCancel }) {
  const [title, setTitle] = useState(padlet.title || "");
  const [content, setContent] = useState(padlet.preview || "");
  const [attachment, setAttachment] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      
      // Hiển thị preview nếu là hình ảnh
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          // Có thể sử dụng event.target.result để hiển thị preview
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Bắt đầu ghi âm
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Cannot access microphone. Please check permissions.');
    }
  };

  // Dừng ghi âm
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Xử lý submit form
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

  // Xóa bản ghi âm
  const clearRecording = () => {
    setAudioBlob(null);
    setAudioURL("");
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
          required
        />

        <div className="toolbar">
           {/* Formatting buttons */}
           <div className="formatting-group">
            <button type="button" onClick={() => formatText('bold')} title="Bold">
              <strong>B</strong>
            </button>
            <button type="button" onClick={() => formatText('italic')} title="Italic">
              <em>I</em>
            </button>
            <button type="button" onClick={() => formatText('underline')} title="Underline">
              <u>U</u>
            </button>
            <select onChange={(e) => formatText('fontSize', e.target.value)} title="Font size">
              <option value="">Size</option>
              <option value="1">Small</option>
              <option value="3">Medium</option>
              <option value="5">Large</option>
              <option value="7">Huge</option>
            </select>
            <select onChange={(e) => formatText('foreColor', e.target.value)} title="Text color">
              <option value="">Color</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="black">Black</option>
            </select>
          </div>

          <div className="file-recording-group">
            {/* File input */}
            <label className="file-upload-btn">
              <input 
                type="file" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="image/*,audio/*,video/*,application/pdf" 
              />
              📎
            </label>
            
            {/* Audio recording */}
            {!isRecording ? (
              <button 
                type="button" 
                onClick={startRecording} 
                className="record-btn"
                disabled={isRecording}
              >
                🎤
              </button>
            ) : (
              <button 
                type="button" 
                onClick={stopRecording} 
                className="stop-record-btn"
              >
                ⏹ 
              </button>
            )}
          </div>
        </div>

        {/* Hiển thị file đính kèm nếu có */}
        {attachment && (
          <div className="attachment-preview">
            <p>File đính kèm: {attachment.name}</p>
            {attachment.type.startsWith('image/') && (
              <img 
                src={URL.createObjectURL(attachment)} 
                alt="Preview" 
                style={{ maxWidth: '100px', maxHeight: '100px' }} 
              />
            )}
          </div>
        )}

        {/* Hiển thị audio player nếu có ghi âm */}
        {audioURL && (
          <div className="audio-preview">
            <audio controls src={audioURL} />
            <button 
              type="button" 
              onClick={clearRecording} 
              className="clear-audio-btn"
            >
              Xóa ghi âm
            </button>
          </div>
        )}

        <textarea 
          className="padlet-content-area"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung..."
          required
        />

        <div className="button-group">
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}