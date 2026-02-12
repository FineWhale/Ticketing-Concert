import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

interface HeaderProps {
  onContactClick?: () => void;
  onBookClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onContactClick,
  onBookClick,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="header-bar">
      <img src="/images/logo.png" alt="Logo" className="logo-header" />
      <div className="header-actions">
        <span className="contact-link" onClick={onContactClick}>
          Contact
        </span>
        {isAuthenticated ? (
          <span
            className="contact-link"
            onClick={() => navigate("/profile")}
          >
            Profile
          </span>
        ) : (
          <span
            className="contact-link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        )}
        <button className="book-btn" onClick={onBookClick}>
          Book Now
        </button>
      </div>
    </div>
  );
};
