import React from "react";

interface AuthTemplateProps {
  children: React.ReactNode;
  header: React.ReactNode;
  backgroundImage?: string;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  header,
  backgroundImage = "/images/beachboys-login.jpg",
}) => {
  return (
    <div className="auth-page">
      {header}

      <div className="auth-container">
        <div className="left-section">
          <img src={backgroundImage} alt="Beach" />
          <div className="overlay" />
        </div>

        <div className="right-section">{children}</div>
      </div>
    </div>
  );
};
