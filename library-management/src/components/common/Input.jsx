import React from "react";

/**
 * Reusable Input Component
 * Supports controlled state, validation error display, labels, icons, helper text
 */
export function Input({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  helperText,
  icon,
  disabled = false,
  className = "",
  autoComplete,
  ...props
}) {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-field-group ${error ? "has-error" : ""} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-star"> *</span>}
        </label>
      )}

      <div className="input-wrapper">
        {icon && <span className="input-icon-adornment">{icon}</span>}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`form-input-control ${icon ? "with-icon" : ""} ${error ? "input-error" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>

      {error ? (
        <span id={`${inputId}-error`} className="field-validation-error" role="alert">
          ⚠️ {error}
        </span>
      ) : helperText ? (
        <span id={`${inputId}-helper`} className="field-helper-text">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export default Input;
