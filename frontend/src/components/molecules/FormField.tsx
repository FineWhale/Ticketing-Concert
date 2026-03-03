import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-field-label">
        {required && <span className="required-asterisk">* </span>}
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="form-field-input"
      />
      {error && <div className="form-field-error">{error}</div>}
    </div>
  );
};
