/**
 * Validation utility functions
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter" };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" };
  }

  return { isValid: true };
};

/**
 * Validates required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * Validates name (first name, last name)
 */
export const validateName = (name: string, fieldName: string): ValidationResult => {
  const requiredCheck = validateRequired(name, fieldName);
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }

  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (name.length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true };
};

/**
 * Validates phone number
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { isValid: false, error: "Invalid phone number" };
  }

  return { isValid: true };
};

/**
 * Sanitizes string input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Validates form data
 */
export const validateForm = (
  data: Record<string, string>,
  rules: Record<string, (value: string) => ValidationResult>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field] || "";
    const result = rules[field](value);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  });

  return errors;
};
