import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  htmlType?: "button" | "submit";
  variant?: "primary" | "secondary";
  className?: string;
}

export const ButtonAtom: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  htmlType = "button",
  variant = "primary",
  className = "",
}) => (
  <button
    type={htmlType}
    onClick={onClick}
    disabled={disabled || loading}
    className={`button-atom ${variant} ${className} ${disabled || loading ? "disabled" : ""}`}
  >
    {loading ? "Loading..." : children}
  </button>
);
