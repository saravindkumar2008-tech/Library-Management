/**
 * Centralized Form Validation Utility
 * Supports Login, Borrow Request, Renewal Request, and Profile forms.
 */

// Regex patterns
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^(\+?\d{1,4}[\s-]?)?\(?\d{2,5}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}$/;
export const MEMBER_ID_REGEX = /^[A-Z0-9]{2,8}(-[A-Z0-9]{2,6})*(-\d{1,6})?$/i;

/**
 * Validate required field
 */
export function validateRequired(value, fieldName = "Field") {
  if (value === null || value === undefined || String(value).trim() === "") {
    return `${fieldName} is required`;
  }
  return "";
}

/**
 * Validate Email address format
 */
export function validateEmail(email) {
  const requiredErr = validateRequired(email, "Email address");
  if (requiredErr) return requiredErr;
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Please enter a valid email address (e.g., member@example.com)";
  }
  return "";
}

/**
 * Validate Phone Number format
 */
export function validatePhone(phone) {
  if (!phone || String(phone).trim() === "") {
    return "Phone number is required";
  }
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return "Phone number must be between 10 and 15 digits";
  }
  if (!PHONE_REGEX.test(phone.trim())) {
    return "Please enter a valid phone number (e.g., +91 98765 43210)";
  }
  return "";
}

/**
 * Validate Password
 */
export function validatePassword(password, minLength = 6) {
  const requiredErr = validateRequired(password, "Password");
  if (requiredErr) return requiredErr;
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }
  return "";
}

/**
 * Validate Member ID format
 */
export function validateMemberId(memberId) {
  const requiredErr = validateRequired(memberId, "Member ID");
  if (requiredErr) return requiredErr;
  const clean = memberId.trim();
  if (clean.length < 4) {
    return "Member ID must be at least 4 characters";
  }
  if (!MEMBER_ID_REGEX.test(clean)) {
    return "Invalid Member ID format. Example format: AK-LIB-101";
  }
  return "";
}

/**
 * Validate Member ID or Email identifier for Login
 */
export function validateLoginIdentifier(identifier) {
  const requiredErr = validateRequired(identifier, "Member ID or Email");
  if (requiredErr) return requiredErr;

  const clean = identifier.trim();
  if (clean.includes("@")) {
    if (!EMAIL_REGEX.test(clean)) {
      return "Please enter a valid email address";
    }
  } else {
    if (clean.length < 3) {
      return "Member ID must be at least 3 characters";
    }
  }
  return "";
}

/**
 * Validate Renewal Request
 * Validates maximum renewals, overdue status, and loan standing
 */
export function validateRenewalRequest(book) {
  if (!book) {
    return { isValid: false, error: "Book not found for renewal." };
  }

  const renewalsUsed = book.renewalCount || 0;
  const maxRenewals = book.maxRenewals || 2;

  // Max renewals check
  if (renewalsUsed >= maxRenewals) {
    return {
      isValid: false,
      error: `Renewal limit reached: You have already used all ${maxRenewals} renewals for "${book.title}".`
    };
  }

  // Overdue check
  if (book.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(book.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return {
        isValid: false,
        error: `Cannot renew book: It is severely overdue by ${diffDays} days. Please return it to the circulation desk.`
      };
    }
  }

  return { isValid: true, error: "" };
}

/**
 * Validate Profile Information Form
 */
export function validateProfileForm(formData) {
  const errors = {};

  const nameErr = validateRequired(formData.name, "Full Name");
  if (nameErr) {
    errors.name = nameErr;
  } else if (formData.name.trim().length < 3) {
    errors.name = "Full name must be at least 3 characters";
  }

  const emailErr = validateEmail(formData.email);
  if (emailErr) errors.email = emailErr;

  const memberIdErr = validateMemberId(formData.memberId);
  if (memberIdErr) errors.memberId = memberIdErr;

  const phoneErr = validatePhone(formData.phone);
  if (phoneErr) errors.phone = phoneErr;

  const branchErr = validateRequired(formData.branch, "Library Branch");
  if (branchErr) errors.branch = branchErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate Borrow / Hold Request Form
 */
export function validateBorrowForm(formData) {
  const errors = {};

  const nameErr = validateRequired(formData.borrowerName, "Borrower Name");
  if (nameErr) errors.borrowerName = nameErr;

  const memberIdErr = validateMemberId(formData.memberId);
  if (memberIdErr) errors.memberId = memberIdErr;

  const emailErr = validateEmail(formData.email);
  if (emailErr) errors.email = emailErr;

  if (formData.phone) {
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errors.phone = phoneErr;
  }

  if (!formData.loanDuration || formData.loanDuration <= 0) {
    errors.loanDuration = "Please select a valid loan duration";
  }

  if (!formData.agreeTerms) {
    errors.agreeTerms = "You must agree to the library loan circulation terms";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
