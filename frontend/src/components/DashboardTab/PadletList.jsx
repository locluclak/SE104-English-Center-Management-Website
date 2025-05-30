import React, { useState } from "react";
import "./PadletList.css";

export default function PadletList({ padlets, onSelect, onEdit, onDelete }) {
  const [openMenuId, setOpenMenuId] = useState(null); // Lưu id padlet đang mở menu

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id); // bật/tắt menu
  };

  const handleEdit = (padlet) => {
    onEdit(padlet);
    setOpenMenuId(null);
  };

  const handleDelete = (id) => {
    onDelete(id);
    setOpenMenuId(null);
  };

  return (
    <div className="padlet-list">
      {padlets.map(({ id, title, preview }) => (
        <div className="padlet-card" key={id}>
          <div className="padlet-card-content" onClick={() => onSelect({ id, title, preview })}>
            <h3 className="padlet-title">{title}</h3>
            <p className="padlet-preview">{preview ?? "Không có nội dung"}</p>
          </div>

          <div className="padlet-actions">
            <button
              className="more-button"
              onClick={(e) => toggleMenu(id, e)}
            >
              ⋮
            </button>

            {openMenuId === id && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-item" onClick={() => handleEdit({ id, title, preview })}>Sửa</div>
                <div className="dropdown-item" onClick={() => handleDelete(id)}>Xóa</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
