import React from "react";

interface InputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
}

export const InputAtom: React.FC<InputProps> = ({
  placeholder,
  value,
  onChange,
  type = "text",
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="
      w-full h-14 px-5 py-3 text-lg rounded-2xl
      bg-white/90 backdrop-blur-sm border-2 border-white/30
      focus:border-white/50 focus:outline-none focus:ring-4 focus:ring-white/20
      placeholder:text-gray-500 placeholder:font-medium
    "
    style={{ fontFamily: "system-ui, -apple-system" }}
  />
);
