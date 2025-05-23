// Padlet.jsx
import React, { useState } from "react";
import PadletList from "./PadletList";
import PadletDetail from "./PadletDetail";

import "./PadletTab.css";

const initialNotes = [
  {
    id: 1,
    title: "Học từ vựng chủ đề du lịch",
    preview: "Hôm nay học các từ liên quan đến đặt phòng khách sạn...",
  },
  {
    id: 2,
    title: "Ngữ pháp Thì hiện tại đơn",
    preview: "Ôn lại cấu trúc và cách dùng thì hiện tại đơn...",
  },
];

export default function Padlet() {
  const [padlets, setPadlets] = useState(initialNotes);
  const [activePadlet, setActivePadlet] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const createDraftPadlet = () => {
    const draft = {
      id: Date.now(),
      title: "Untitled",
      preview: ""
    };
    setPadlets([draft, ...padlets]);
    setActivePadlet(draft);
    setEditMode(true);
  };

  const updatePadlet = (updatedPadlet) => {
    setPadlets((prev) =>
      prev.map((p) => (p.id === updatedPadlet.id ? updatedPadlet : p))
    );
  };

  const exitEditMode = () => {
    setActivePadlet(null);
    setEditMode(false);
  };

  const deletePadlet = (padletId) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa ghi chú này?");
    if (confirmDelete) {
      setPadlets((prev) => prev.filter((p) => p.id !== padletId));
      exitEditMode();
    }
  };

  const editPadlet = (padlet) => {
    setActivePadlet(padlet);
    setEditMode(true);
  };

  return (
    <div className="padlet-grid-container">
      {!activePadlet && (
        <>
          <PadletList
            padlets={padlets}
            onSelect={(p) => {
              setActivePadlet(p);
              setEditMode(false);
            }}
            onEdit={(p) => {
              setActivePadlet(p);
              setEditMode(true);
            }}
            onDelete={deletePadlet}
          />

          <button className="fab" onClick={createDraftPadlet} aria-label="Thêm ghi chú mới">+</button>
        </>
      )}

      {activePadlet && (
        <PadletDetail
          padlet={activePadlet}
          onBack={exitEditMode}
          onDelete={deletePadlet}
          onEdit={updatePadlet}
          isEditMode={editMode}
        />
      )}
    </div>
  );
}
