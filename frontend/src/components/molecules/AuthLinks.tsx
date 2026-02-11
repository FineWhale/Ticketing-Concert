import React from "react";

interface AuthLinksProps {
  text: string;
  linkText: string;
  onLinkClick: () => void;
}

export const AuthLinks: React.FC<AuthLinksProps> = ({
  text,
  linkText,
  onLinkClick,
}) => {
  return (
    <div className="auth-links">
      <span className="auth-links-text">{text} </span>
      <span className="auth-links-link" onClick={onLinkClick}>
        {linkText}
      </span>
    </div>
  );
};
