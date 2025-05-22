import React from "react";
import "./PadletDetail.css";

export default function PadletDetail({ padlet, onBack }) {
  return (
    <div className="padlet-detail">
      <button className="back-button" onClick={onBack}>← Trở lại</button>
      <h2>{padlet.title}</h2>
      <p>{padlet.preview ?? "Không có nội dung chi tiết."}</p>
    </div>
  );
}