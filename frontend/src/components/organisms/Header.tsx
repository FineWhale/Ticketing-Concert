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
    <div className="fixed top-0 left-0 right-0 h-[72px] bg-primary px-12 flex items-center justify-between z-[100]">
      <img src="/images/logo.png" alt="Logo" className="h-10 object-contain" />
      <div className="flex items-center gap-8 text-sm font-medium text-white">
        <span className="cursor-pointer" onClick={onContactClick}>
          Contact
        </span>
        {isAuthenticated ? (
          <span
            className="cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            Profile
          </span>
        ) : (
          <span
            className="cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        )}
        <button 
          className="px-5 py-2 rounded-full border-none bg-yellow text-[#1a1a1a] font-bold cursor-pointer hover:brightness-95" 
          onClick={onBookClick}
        >
          Book Ticket
        </button>
      </div>
    </div>
  );
};
