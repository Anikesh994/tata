/**
 * utils/formatters.js
 * Shared formatting helpers used across multiple pages.
 */

/** Convert bytes to a human-readable string (e.g. "1.4 MB") */
export function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024)             return `${bytes} B`;
  if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format an ISO date string into a readable locale string */
export function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
