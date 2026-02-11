import React, { useState } from "react";
import { ButtonAtom } from "../atoms";
import { FormField, AuthLinks } from "../molecules";

interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  required?: boolean;
}

interface AuthFormProps {
  title: string;
  fields: FormFieldConfig[];
  submitButtonText: string;
  onSubmit: (values: Record<string, string>) => void;
  linkText: string;
  linkLabel: string;
  onLinkClick: () => void;
  loading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  fields,
  submitButtonText,
  onSubmit,
  linkText,
  linkLabel,
  onLinkClick,
  loading = false,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formValues[field.name] || "";

      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} required`;
      } else if (field.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = "Valid email required";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formValues);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1 className="auth-title">{title}</h1>

      {fields.map((field) => (
        <FormField
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type}
          placeholder={field.placeholder}
          value={formValues[field.name] || ""}
          onChange={(value) => handleChange(field.name, value)}
          error={errors[field.name]}
          required={field.required}
          disabled={loading}
        />
      ))}

      <div className="auth-form-button-wrapper">
        <ButtonAtom
          htmlType="submit"
          disabled={loading}
          loading={loading}
          className="submit-btn"
        >
          {submitButtonText}
        </ButtonAtom>
      </div>

      <AuthLinks
        text={linkText}
        linkText={linkLabel}
        onLinkClick={onLinkClick}
      />
    </form>
  );
};
