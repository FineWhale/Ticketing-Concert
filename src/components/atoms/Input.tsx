import React from "react";

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password";
  className?: string;
  name?: string;
  disabled?: boolean;
}

export const InputAtom: React.FC<InputProps> = ({
  placeholder = "",
  value,
  onChange,
  type = "text",
  className = "",
  name,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  if (type === "password") {
    return (
      <input
        type="password"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`input-atom ${className}`}
      />
    );
  }

  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`input-atom ${className}`}
    />
  );
};
