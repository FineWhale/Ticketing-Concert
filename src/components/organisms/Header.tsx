import React from "react";

interface HeaderProps {
  onContactClick?: () => void;
  onBookClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onContactClick,
  onBookClick,
}) => {
  return (
    <div className="header-bar">
      <img src="/images/logo.png" alt="Logo" className="logo-header" />
      <div className="header-actions">
        <span className="contact-link" onClick={onContactClick}>
          Contact
        </span>
        <span className="contact-link">Profile</span>
        <button className="book-btn" onClick={onBookClick}>
          Book Now
        </button>
      </div>
    </div>
  );
};
