import React from "react";
import "./PadletList.css";

export default function PadletList({ padlets, onSelect }) {
  return (
    <div className="padlet-list">
      {padlets.map(({ id, title, preview }) => (
        <div className="padlet-card" key={id} onClick={() => onSelect({ id, title, preview })}>
          <h3 className="padlet-title">{title}</h3>
          <p className="padlet-preview">{preview ?? "Không có nội dung"}</p>
        </div>
      ))}
    </div>
  );
}