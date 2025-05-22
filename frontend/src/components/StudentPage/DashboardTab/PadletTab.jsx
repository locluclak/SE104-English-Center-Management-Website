// Padlet.jsx
import React, { useState } from "react";
import PadletList from "./PadletList";
import CreatePadlet from "./CreatePadlet";
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

  const createDraftPadlet = () => {
    const draft = {
      id: Date.now(),
      title: "Untitled",
      preview: ""
    };
    setPadlets([draft, ...padlets]);
    setActivePadlet(draft);
  };

  const updatePadlet = (updatedPadlet) => {
    setPadlets((prev) =>
      prev.map((p) => (p.id === updatedPadlet.id ? updatedPadlet : p))
    );
  };

  const exitEditMode = () => setActivePadlet(null);

  return (
    <div className="padlet-grid-container">
      {!activePadlet && (
        <>
          <PadletList padlets={padlets} onSelect={setActivePadlet} />
          <button className="fab" onClick={createDraftPadlet} aria-label="Thêm ghi chú mới">+</button>
        </>
      )}

      {activePadlet && (
        <CreatePadlet
          padlet={activePadlet}
          onUpdate={updatePadlet}
          onClose={exitEditMode}
        />
      )}
    </div>
  );
}