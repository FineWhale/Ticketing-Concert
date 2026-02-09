import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  htmlType?: "button" | "submit";
}

export const ButtonAtom: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  htmlType = "button",
}) => (
  <button
    type={htmlType}
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      width: 200,
      height: 44,
      borderRadius: 999,
      border: "none",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      backgroundColor: loading ? "#9e9e9e" : "#2e7d1f",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "Inter, system-ui, -apple-system",
      boxShadow: loading ? "none" : "0 8px 18px rgba(34, 139, 34, 0.45)",
      transition: "all 0.2s ease",
    }}
    onMouseOver={(e) => {
      if (disabled || loading) return;
      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#276718";
    }}
    onMouseOut={(e) => {
      if (disabled || loading) return;
      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2e7d1f";
    }}
  >
    {loading ? "Loading..." : children}
  </button>
);
