export type Validator = (value: string) => string | undefined;

export function validateRequired(label: string): Validator {
  return (value) =>
    value.trim().length > 0 ? undefined : `${label} is required.`;
}

export const validateEmail: Validator = (value) => {
  const email = value.trim();
  if (!email) return "Email address is required.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email)) {
    return "Enter a valid email address, such as name@example.com.";
  }
  return undefined;
};

export const validatePhone: Validator = (value) => {
  const phone = value.trim().replace(/[\s()-]/g, "");
  if (!phone) return "Mobile number is required.";
  if (!/^(?:0[6-8]\d{8}|\+27[6-8]\d{8})$/.test(phone)) {
    return "Enter a valid South African number, e.g. 082 123 4567 or +27 82 123 4567.";
  }
  return undefined;
};

export function validateName(label: string): Validator {
  return (value) => {
    const name = value.trim();
    if (!name) return `${label} is required.`;
    if (name.length < 2) return `${label} must be at least 2 characters.`;
    if (name.length > 80) return `${label} must be 80 characters or fewer.`;
    if (!/^[\p{L}\p{M}'’ -]+$/u.test(name)) {
      return `${label} can only contain letters, spaces, apostrophes, or hyphens.`;
    }
    return undefined;
  };
}

export function validateText(label: string, minLength = 1): Validator {
  return (value) => {
    const text = value.trim();
    if (!text) return `${label} is required.`;
    if (text.length < minLength) {
      return `${label} must be at least ${minLength} characters.`;
    }
    if (text.length > 1000) return `${label} must be 1000 characters or fewer.`;
    return undefined;
  };
}

export const validatePassword: Validator = (value) => {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (value.length > 128) return "Password must be 128 characters or fewer.";
  return undefined;
};

export const validatePostalCode: Validator = (value) => {
  const postalCode = value.trim();
  if (!postalCode) return "Postal code is required.";
  if (!/^\d{4}$/.test(postalCode)) {
    return "Enter a valid 4-digit South African postal code.";
  }
  return undefined;
};

export const validateDonationAmount: Validator = (value) => {
  const amount = value.trim();
  if (!amount) return undefined;
  if (!/^\d{1,9}(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
    return "Enter a positive amount using up to 2 decimal places.";
  }
  return undefined;
};

export function validateFields(
  fields: { value: string; validate: Validator }[],
): string | undefined {
  return fields.map(({ value, validate }) => validate(value)).find(Boolean);
}
