/**
 * Input Validation and Sanitization Utilities
 * Provides validation and sanitization functions for user inputs
 */

/**
 * Validate and sanitize a number input
 */
export function validateNumber(
  value: unknown,
  options: {
    min?: number;
    max?: number;
    default?: number;
    required?: boolean;
  } = {}
): number {
  const { min, max, default: defaultValue = 0, required = false } = options;

  // Handle undefined/null
  if (value === undefined || value === null) {
    if (required) {
      throw new Error('Required number value is missing');
    }
    return defaultValue;
  }

  // Convert to number
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  // Validate it's a valid number
  if (isNaN(num)) {
    if (required) {
      throw new Error('Invalid number value');
    }
    return defaultValue;
  }

  // Validate min/max constraints
  if (min !== undefined && num < min) {
    throw new Error(`Number must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new Error(`Number must be at most ${max}`);
  }

  return num;
}

/**
 * Validate and sanitize a string input
 */
export function validateString(
  value: unknown,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    default?: string;
    required?: boolean;
    trim?: boolean;
  } = {}
): string {
  const {
    minLength,
    maxLength,
    pattern,
    default: defaultValue = '',
    required = false,
    trim = true,
  } = options;

  // Handle undefined/null
  if (value === undefined || value === null) {
    if (required) {
      throw new Error('Required string value is missing');
    }
    return defaultValue;
  }

  // Convert to string
  let str = String(value);

  // Trim if requested
  if (trim) {
    str = str.trim();
  }

  // Validate required
  if (required && str.length === 0) {
    throw new Error('Required string value is empty');
  }

  // Validate min length
  if (minLength !== undefined && str.length < minLength) {
    throw new Error(`String must be at least ${minLength} characters`);
  }

  // Validate max length
  if (maxLength !== undefined && str.length > maxLength) {
    throw new Error(`String must be at most ${maxLength} characters`);
  }

  // Validate pattern
  if (pattern && !pattern.test(str)) {
    throw new Error('String does not match required pattern');
  }

  return str;
}

/**
 * Validate and sanitize an array of numbers (SDG IDs)
 */
export function validateSDGIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    throw new Error('SDG IDs must be an array');
  }

  const validIds: number[] = [];

  for (const item of value) {
    const id = validateNumber(item, {
      min: 1,
      max: 17,
      required: true,
    });

    // Check for duplicates
    if (validIds.includes(id)) {
      throw new Error(`Duplicate SDG ID: ${id}`);
    }

    validIds.push(id);
  }

  return validIds;
}

/**
 * Validate project inputs
 */
export function validateProjectInputs(inputs: Record<string, unknown>): {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
} {
  return {
    budget: validateNumber(inputs.budget, {
      min: 0,
      required: true,
    }),
    beneficiaries: validateNumber(inputs.beneficiaries, {
      min: 1,
      required: true,
    }),
    duration: validateNumber(inputs.duration, {
      min: 1,
      max: 120, // Max 10 years
      required: true,
    }),
    teamSize: validateNumber(inputs.teamSize, {
      min: 1,
      max: 100,
      required: true,
    }),
    riskLevel: validateNumber(inputs.riskLevel, {
      min: 0,
      max: 100,
      default: 50,
    }),
  };
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Validate and sanitize user-provided text
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  // Remove potentially dangerous characters
  let sanitized = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[\u0000-\u001F\u200B-\u200D\uFEFF]/g, ''); // Remove Unicode control characters

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
