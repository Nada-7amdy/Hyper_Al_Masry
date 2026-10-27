/**
 * Hyper Al Masri - Egyptian Phone & Numeral Normalization Utilities
 * Supports Eastern Arabic-Indic numerals (٠-٩) and Persian numerals (۰-۹),
 * spaces, dashes, parentheses, and international dialing prefixes (+20, 0020, 20).
 */

/**
 * Converts Eastern Arabic numerals (٠-٩) and Persian numerals (۰-۹) to standard Latin digits (0-9).
 * Leaves other characters untouched.
 */
export const normalizeArabicNumerals = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
};

/**
 * Standard Egyptian Mobile Phone Regex:
 * Must be exactly 11 digits starting with 010, 011, 012, or 015.
 */
export const EGY_PHONE_REGEX = /^(010|011|012|015)[0-9]{8}$/;

/**
 * Normalizes an Egyptian phone number input:
 * 1. Converts Eastern Arabic / Persian numerals to ASCII digits.
 * 2. Strips whitespace, dashes, parentheses, dots, and slashes.
 * 3. Handles international dialing prefixes:
 *    - +201XXXXXXXXX -> 01XXXXXXXXX
 *    - 00201XXXXXXXXX -> 01XXXXXXXXX
 *    - 201XXXXXXXXX (12 digits) -> 01XXXXXXXXX
 * 
 * Returns the cleaned, normalized string.
 */
export const normalizeEgyptianPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Convert Eastern Arabic and Persian numerals to 0-9
  let cleaned = normalizeArabicNumerals(phone);

  // Remove common separators and formatting
  cleaned = cleaned.replace(/[\s\-\(\)\.\/\_]+/g, '').trim();

  // Strip international prefixes if present
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0020')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  }

  return cleaned;
};

/**
 * Checks if a given input string represents a valid Egyptian mobile phone number,
 * taking into account Arabic numerals, prefixes, and spaces.
 */
export const isValidEgyptianPhone = (phone: string): boolean => {
  const normalized = normalizeEgyptianPhone(phone);
  return EGY_PHONE_REGEX.test(normalized);
};
