import React, { useState, useRef, useEffect } from "react"; // Added useEffect
import { FaMicrophone, FaPaperclip, FaStop } from 'react-icons/fa';
import './ResourceForm.css'; // You'll need to create this CSS file

// Add initialData and isEditMode props
const ResourceForm = ({ onSubmit, onCancel, type, initialData, isEditMode }) => {
  const [title, setTitle] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const textAreaRef = useRef(null);
  const [audioURL, setAudioURL] = useState("");

  // New state for start and end dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Determine the label for the title input based on the 'type' prop
  const titleLabel = type === 'assignment' ? '📘 Tên bài tập:' : 'Document\'s Name:';
  const formClassName = type === 'assignment' ? 'assignment-form' : 'document-form';
  const submitButtonText = isEditMode ? 'Update' : 'Save'; // Change button text based on mode

  // Use useEffect to populate form fields when initialData changes (i.e., when editing)
  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.NAME || '');
      // For description, set innerHTML of contentEditable div
      if (textAreaRef.current) {
        textAreaRef.current.innerHTML = initialData.DESCRIPTION || '';
      }
      // Set dates for assignments
      if (type === 'assignment') {
        // Format dates to YYYY-MM-DD for input type="date"
        setStartDate(initialData.START_DATE ? new Date(initialData.START_DATE).toISOString().split('T')[0] : '');
        setEndDate(initialData.END_DATE ? new Date(initialData.END_DATE).toISOString().split('T')[0] : '');
      }
      // Files and audio are not pre-filled as we generally don't re-upload on edit unless explicitly chosen.
      // If you need to show existing file/audio, you'd fetch their URLs and display them,
      // but the actual file object won't be available from initialData.
    } else {
        // Clear form when not in edit mode (e.g., when switching from edit to add)
        setTitle('');
        setAttachment(null);
        clearRecording();
        if (textAreaRef.current) {
            textAreaRef.current.innerHTML = '';
        }
        setStartDate('');
        setEndDate('');
    }
  }, [isEditMode, initialData, type]); // Dependencies for useEffect


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
    const description = textAreaRef.current.innerHTML;

    const formData = {
      title,
      description,
      file: attachment,
      audioBlob,
    };

    if (type === 'assignment') {
      formData.startDate = startDate;
      formData.endDate = endDate;
    }

    onSubmit(formData); // Pass data back to parent component (CourseDetail)

    // Form fields are reset by the useEffect when initialData becomes null
    // or when isEditMode changes to false after submission in CourseDetail
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    textAreaRef.current.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={`resource-form ${formClassName}`}>
      <h3>{isEditMode ? `Edit ${type}` : `Add New ${type}`}</h3> {/* Dynamic heading */}
      <label>{titleLabel}</label>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />

      {type === 'assignment' && (
        <div className="date-inputs">
          <label htmlFor="startDate">Ngày bắt đầu:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />

          <label htmlFor="endDate">Ngày kết thúc:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
        </div>
      )}

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
        <button type="submit">{submitButtonText}</button> {/* Dynamic button text */}
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default ResourceForm;