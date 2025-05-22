import React from "react";
import "./CreatePadlet.css";

export default function CreatePadlet({ padlet, onUpdate, onClose }) {
  const handleChange = (field, value) => {
    onUpdate({ ...padlet, [field]: value });
  };

  return (
    <div className="create-padlet-overlay">
      <form className="create-padlet-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          className="padlet-title-input"
          placeholder="Nhập tiêu đề..."
          value={padlet.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
        <textarea
          className="padlet-content-area"
          placeholder="Viết nội dung ghi chú tại đây..."
          value={padlet.preview}
          onChange={(e) => handleChange("preview", e.target.value)}
        />
        <div className="button-group">
          <button type="button" onClick={onClose}>Quay lại danh sách</button>
        </div>
      </form>
    </div>
  );
}