import React, { useState, useRef } from "react";
import './AssignmentForm.css';

const AssignmentForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const textAreaRef = useRef(null);
  const [audioURL, setAudioURL] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {};
        reader.readAsDataURL(file);
      }
    }
  };

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
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Cannot access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const description = textAreaRef.current.innerHTML;

    const assignmentData = {
      title,
      description,
      file: attachment,
      audioBlob,
    };

    onSubmit(assignmentData);

    setTitle('');
    setAttachment(null);
    clearRecording();
    textAreaRef.current.innerHTML = '';
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    textAreaRef.current.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="assignment-form">
      <label>📘 Tên bài tập:</label>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />

      <div className="toolbar">
        <div className="formatting-group">
          <button type="button" onClick={() => formatText('bold')} title="Bold"><strong>B</strong></button>
          <button type="button" onClick={() => formatText('italic')} title="Italic"><em>I</em></button>
          <button type="button" onClick={() => formatText('underline')} title="Underline"><u>U</u></button>
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
          <label className="file-upload-btn">
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,audio/*,video/*,application/pdf"
            />
            📎
          </label>

          {!isRecording ? (
            <button type="button" onClick={startRecording} className="record-btn">🎤</button>
          ) : (
            <button type="button" onClick={stopRecording} className="stop-record-btn">⏹</button>
          )}
        </div>
      </div>

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

      {audioURL && (
        <div className="audio-preview">
          <audio controls src={audioURL} />
          <button type="button" onClick={clearRecording} className="clear-audio-btn">
            Xóa ghi âm
          </button>
        </div>
      )}

      <div
        contentEditable
        ref={textAreaRef}
        className="editor"
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "200px",
          marginTop: "10px",
        }}
      ></div>

      <div className="button-group">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default AssignmentForm;
