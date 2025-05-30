import React from "react";
import CreatePadlet from "./CreatePadlet";
import "./PadletDetail.css";

export default function PadletDetail({ padlet, isEditMode, onEdit, onDelete, onBack }) {
  return (
    <div className="padlet-detail-fullscreen">
      {isEditMode ? (
        <CreatePadlet
          padlet={padlet}
          onSubmit={onEdit}
          onCancel={onBack}
        />
      ) : (
        <div className="padlet-detail-content">
          <button className="back-button" onClick={onBack}>← Trở lại</button>
          <h2>{padlet.title}</h2>
          <p>{padlet.preview}</p>
          {padlet.attachment && (
            <p>📎 Tệp: {padlet.attachment.name || "(file đã được đính kèm)"}</p>
          )}
          {padlet.audio && (
            <div>
              <p>🔊 Ghi âm:</p>
              <audio controls src={URL.createObjectURL(padlet.audio)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
