/**
 * utils/csvSanitizer.js
 * Strips CSV injection prefixes from every cell value.
 *
 * Attackers craft cells like =CMD|'/c calc'!A0 that execute
 * as formulas when opened in Excel/Sheets. Prefixing with '
 * makes spreadsheets treat the value as plain text.
 */

// Characters that trigger formula evaluation in spreadsheets
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

const sanitizeRow = (row) => {
  const clean = {};
  for (const [key, value] of Object.entries(row)) {
    const str = String(value ?? "").trim();
    clean[key] = FORMULA_PREFIX.test(str) ? `'${str}` : str;
  }
  return clean;
};

module.exports = { sanitizeRow };
