import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaPaperclip, FaStop } from 'react-icons/fa';
import './SubmissionForm.css';

const SubmissionForm = ({ onSubmit, onCancel, initialData, isEditMode }) => {
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [audioURL, setAudioURL] = useState("");

  useEffect(() => {
    if (isEditMode && initialData) {
      setDescription(initialData.DESCRIPTION || ''); 
    } else {
        setDescription('');
        setAttachment(null);
        clearRecording();
    }
  }, [isEditMode, initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
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

    const formData = {
      description,
      file: attachment,
      audioBlob,
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="submission-form">
      <h3>{isEditMode ? 'Edit Your Submission' : 'Submit Your Work'}</h3>

      <div className="toolbar">
        {/* Simplified toolbar, removed text formatting for submission */}
        <div className="file-recording-group">
          <label className="file-upload-btn">
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            />
            <FaPaperclip />
          </label>

          {!isRecording ? (
            <button type="button" onClick={startRecording} className="record-btn"> <FaMicrophone /> </button>
          ) : (
            <button type="button" onClick={stopRecording} className="stop-record-btn"> <FaStop /> </button>
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

      <label>Mô tả bài làm:</label>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Nhập mô tả bài làm của bạn tại đây..."
        rows="5"
        style={{
          width: "calc(100% - 22px)",
          padding: "10px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "1rem",
          resize: "vertical",
        }}
      />

      <div className="button-group">
        <button type="submit">{isEditMode ? 'Update' : 'Submit'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default SubmissionForm;