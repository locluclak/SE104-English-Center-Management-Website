import React from "react";
import "./Card.css";
import DropdownMenu from "../Button/DropdownMenu";

const Card = ({ title, children, onClick, onEdit, onDelete, role }) => {
  const handleCardClick = (e) => {
    if (e.target.closest(".dropdown-menu")) return;
    onClick?.();
  };

  const showDropdown = role === "admin" || role === "teacher";

  return (
    <div className="custom-card" onClick={handleCardClick}>
      <div className="card-header">
        <h3>{title}</h3>
        {showDropdown && <DropdownMenu onEdit={onEdit} onDelete={onDelete} />}
      </div>
      {children && <div className="card-content">{children}</div>}
    </div>
  );
};

export default Card;
